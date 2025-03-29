
import MainLayout from "../components/MainLayout";
import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ImagePlus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Define photo type
type ClubPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  uploadedBy: string;
  dateUploaded: string;
};

// Sample club photos
const samplePhotos: ClubPhoto[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "Team Practice",
    description: "Team practicing at SAPS Training College grounds",
    uploadedBy: "admin",
    dateUploaded: "2023-03-15"
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "League Match",
    description: "Tshwane Sporting FC vs. Mamelodi FC",
    uploadedBy: "admin",
    dateUploaded: "2023-04-20"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "Trophy Ceremony",
    description: "Celebration after winning the local league",
    uploadedBy: "admin",
    dateUploaded: "2023-05-30"
  }
];

const ClubPhotosPage = () => {
  const { user } = useContext(UserContext);
  const isAdmin = user.role === "admin";
  const { toast } = useToast();
  
  // Initialize photos from localStorage or use sample data
  const [photos, setPhotos] = useState<ClubPhoto[]>(() => {
    const storedPhotos = localStorage.getItem("clubPhotos");
    return storedPhotos ? JSON.parse(storedPhotos) : samplePhotos;
  });
  
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    url: ""
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
      setNewPhoto({...newPhoto, url: result});
    };
    reader.readAsDataURL(file);
  };
  
  const handleAddPhoto = () => {
    if (!newPhoto.title || !newPhoto.url) {
      toast({
        title: "Missing information",
        description: "Please provide a title and upload a photo",
        variant: "destructive"
      });
      return;
    }
    
    const photoToAdd: ClubPhoto = {
      id: Date.now().toString(),
      url: newPhoto.url,
      title: newPhoto.title,
      description: newPhoto.description,
      uploadedBy: user.username,
      dateUploaded: new Date().toISOString().split('T')[0]
    };
    
    const updatedPhotos = [...photos, photoToAdd];
    setPhotos(updatedPhotos);
    localStorage.setItem("clubPhotos", JSON.stringify(updatedPhotos));
    
    // Reset form
    setNewPhoto({
      title: "",
      description: "",
      url: ""
    });
    setPhotoPreview(null);
    
    toast({
      title: "Photo added",
      description: "Your photo has been added to the gallery"
    });
  };
  
  const handleDeletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem("clubPhotos", JSON.stringify(updatedPhotos));
    
    toast({
      title: "Photo deleted",
      description: "The photo has been removed from the gallery"
    });
  };

  return (
    <MainLayout title="Club Photos">
      <div className="space-y-8">
        {/* Featured photos carousel */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Club Highlights</CardTitle>
            <CardDescription>Browse through our team's memorable moments</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video overflow-hidden bg-gray-100">
                          <img 
                            src={photo.url} 
                            alt={photo.title} 
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold">{photo.title}</h3>
                          <p className="text-sm text-gray-500">{photo.description}</p>
                        </CardContent>
                        {isAdmin && (
                          <CardFooter className="pt-0 px-4 pb-4 flex justify-end">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="h-8 px-2"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </CardContent>
        </Card>

        {/* Admin upload form */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Photo</CardTitle>
              <CardDescription>Upload new photos to the club gallery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo-title">Photo Title</Label>
                    <Input 
                      id="photo-title" 
                      value={newPhoto.title}
                      onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                      placeholder="Enter a title for the photo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="photo-description">Description</Label>
                    <Input 
                      id="photo-description" 
                      value={newPhoto.description}
                      onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                      placeholder="Brief description of the photo"
                    />
                  </div>
                  
                  <Button 
                    className="bg-tsfc-green hover:bg-tsfc-green/90"
                    onClick={handleAddPhoto}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add to Gallery
                  </Button>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full aspect-video flex flex-col items-center justify-center">
                    {photoPreview ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPhotoPreview(null);
                            setNewPhoto({...newPhoto, url: ""});
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handlePhotoUpload}
                          />
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Photo gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-gray-100">
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{photo.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{photo.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Added by {photo.uploadedBy} on {photo.dateUploaded}
                  </span>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClubPhotosPage;
