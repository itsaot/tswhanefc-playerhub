import { useState, useEffect, useContext } from "react";
import MainLayout from "../components/MainLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon, Heart, HeartOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserContext } from "../contexts/UserContext";

interface ClubPhoto {
  id: string;
  title: string;
  description?: string;
  photoUrl: string;
  uploadDate: string;
  uploadedBy?: string;
  likes?: number;
  likedByCurrentUser?: boolean;
}

const ClubPhotosPage = () => {
  const [photos, setPhotos] = useState<ClubPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useContext(UserContext);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        console.log("Fetching club photos...");
        const { data: photosData, error: photosError } = await supabase
          .from("club_photos")
          .select("*")
          .order("upload_date", { ascending: false });

        if (photosError) {
          console.error("Supabase error when fetching photos:", photosError);
          throw new Error(photosError.message);
        }

        if (!photosData) {
          setPhotos([]);
          return;
        }

        console.log("Photos data received:", photosData);

        const { data: likesData, error: likesError } = await supabase
          .from("photo_likes")
          .select("*")
          .eq("user_id", user.username);

        if (likesError) {
          console.error("Error fetching likes:", likesError);
        }

        const likesCountPromise = Promise.all(
          photosData.map(async (photo) => {
            const { count, error } = await supabase
              .from("photo_likes")
              .select("*", { count: "exact", head: true })
              .eq("photo_id", photo.id);
            
            return { photoId: photo.id, count: count || 0, error };
          })
        );

        const likesCount = await likesCountPromise;
        
        const formattedPhotos: ClubPhoto[] = photosData.map(photo => {
          const photoLikesCount = likesCount.find(lc => lc.photoId === photo.id)?.count || 0;
          const isLikedByUser = likesData 
            ? likesData.some(like => like.photo_id === photo.id)
            : false;

          return {
            id: photo.id,
            title: photo.title,
            description: photo.description || "",
            photoUrl: photo.photo_url,
            uploadDate: new Date(photo.upload_date || Date.now()).toLocaleDateString(),
            uploadedBy: photo.uploaded_by || "Admin",
            likes: photoLikesCount,
            likedByCurrentUser: isLikedByUser
          };
        });
        
        setPhotos(formattedPhotos);
      } catch (err) {
        console.error("Error fetching photos:", err);
        toast({
          title: "Error",
          description: "Failed to load club photos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
    
    const photosSubscription = supabase
      .channel('photos-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'club_photos' 
      }, () => {
        fetchPhotos();
      })
      .subscribe();
      
    const likesSubscription = supabase
      .channel('likes-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'photo_likes' 
      }, () => {
        fetchPhotos();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(photosSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [toast, user.username]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async () => {
    if (!title || (!photoUrl && !photoPreview)) {
      toast({
        title: "Missing information",
        description: "Please provide a title and either upload a photo or enter a photo URL",
        variant: "destructive"
      });
      return;
    }

    if (!isAdmin()) {
      toast({
        title: "Permission denied",
        description: "You need admin privileges to add photos",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const username = user.username || "admin";
      
      const newPhoto = {
        title,
        description,
        photo_url: photoPreview || photoUrl,
        uploaded_by: username
      };

      console.log("Attempting to insert photo:", newPhoto);

      const { data, error } = await supabase
        .from("club_photos")
        .insert(newPhoto)
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message);
      }

      console.log("Photo insert response:", data);

      if (data && data[0]) {
        const addedPhoto: ClubPhoto = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || "",
          photoUrl: data[0].photo_url,
          uploadDate: new Date(data[0].upload_date || Date.now()).toLocaleDateString(),
          uploadedBy: data[0].uploaded_by || username,
          likes: 0,
          likedByCurrentUser: false
        };

        setPhotos(prevPhotos => [addedPhoto, ...prevPhotos]);
        
        setTitle("");
        setDescription("");
        setPhotoUrl("");
        setPhotoPreview(null);
        
        toast({
          title: "Success",
          description: "Photo added successfully",
        });
      }
    } catch (err) {
      console.error("Error adding photo:", err);
      toast({
        title: "Error",
        description: "Failed to add photo to the database. Please ensure you're logged in as admin.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from("club_photos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(error.message);
      }

      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id));
      
      toast({
        title: "Success",
        description: "Photo removed successfully",
      });
    } catch (err) {
      console.error("Error removing photo:", err);
      toast({
        title: "Error",
        description: "Failed to remove photo from the database",
        variant: "destructive"
      });
    }
  };

  const handleToggleLike = async (photoId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        const { error } = await supabase
          .from("photo_likes")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", user.username);

        if (error) {
          console.error("Supabase unlike error:", error);
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase
          .from("photo_likes")
          .insert({
            photo_id: photoId,
            user_id: user.username
          });

        if (error) {
          console.error("Supabase like error:", error);
          throw new Error(error.message);
        }
      }

      setPhotos(prevPhotos => prevPhotos.map(photo => {
        if (photo.id === photoId) {
          return {
            ...photo,
            likes: isLiked ? (photo.likes || 1) - 1 : (photo.likes || 0) + 1,
            likedByCurrentUser: !isLiked
          };
        }
        return photo;
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout title="Club Photos">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isAdmin() && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Team training session" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Weekly training at Tshwane Stadium..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Photo</Label>
                  <div className="border rounded-md p-4">
                    {photoPreview ? (
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => setPhotoPreview(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="rounded-md max-h-[200px] mx-auto"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="relative w-full">
                            <Button 
                              variant="outline" 
                              className="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleFileUpload}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            JPG, PNG or GIF. Max 5MB.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Or enter image URL</Label>
                  <Input 
                    id="photoUrl" 
                    placeholder="https://example.com/image.jpg" 
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    disabled={!!photoPreview}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAddPhoto} 
                  className="w-full bg-tsfc-green hover:bg-tsfc-green/90"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Add Photo"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        <div className={`md:col-span-${isAdmin() ? "2" : "3"}`}>
          <h2 className="text-xl font-semibold mb-4">Club Photo Gallery</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-muted-foreground">Photos will be added by club administrators</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={photo.photoUrl} 
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+not+found";
                      }}
                    />
                    {isAdmin() && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemovePhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold truncate">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>Added: {photo.uploadDate}</span>
                      <span>By: {photo.uploadedBy}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center ${photo.likedByCurrentUser ? 'text-red-500' : ''}`}
                        onClick={() => handleToggleLike(photo.id, !!photo.likedByCurrentUser)}
                      >
                        {photo.likedByCurrentUser ? (
                          <HeartOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Heart className="h-4 w-4 mr-1" />
                        )}
                        {photo.likedByCurrentUser ? 'Unlike' : 'Like'} ({photo.likes || 0})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClubPhotosPage;
