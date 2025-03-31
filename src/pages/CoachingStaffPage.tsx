
import MainLayout from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "../contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, User, Plus, Pencil, Trash2 } from "lucide-react";

interface CoachingStaff {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  qualifications: string | null;
  joined_year: string | null;
  created_at?: string | null;
}

const CoachingStaffPage = () => {
  const [staff, setStaff] = useState<CoachingStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CoachingStaff | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffBio, setStaffBio] = useState("");
  const [staffQualifications, setStaffQualifications] = useState("");
  const [staffSince, setStaffSince] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { isAdmin } = useContext(UserContext);
  
  // Sample data for initial display
  const sampleStaff: CoachingStaff[] = [
    {
      id: "1",
      name: "Coach Jomo",
      role: "Head Coach",
      bio: "Founded Tshwane Sporting FC in 2020 at the SAPS Training college. Has led the team to multiple local tournament victories.",
      photo_url: "https://randomuser.me/api/portraits/men/32.jpg",
      qualifications: "CAF A License, Former Professional Player",
      joined_year: "2020"
    },
    {
      id: "2",
      name: "Sarah Molefe",
      role: "Assistant Coach",
      bio: "Former national team player who joined the coaching staff in 2021. Specializes in technical skills development.",
      photo_url: "https://randomuser.me/api/portraits/women/44.jpg",
      qualifications: "UEFA B License, Sports Science Degree",
      joined_year: "2021"
    },
    {
      id: "3",
      name: "David Nkosi",
      role: "Fitness Coach",
      bio: "Professional fitness trainer with experience working with elite athletes. Focuses on strength and conditioning.",
      photo_url: "https://randomuser.me/api/portraits/men/62.jpg",
      qualifications: "Certified Strength & Conditioning Specialist, Sports Nutrition Certificate",
      joined_year: "2022"
    }
  ];
  
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        console.log("Fetching coaching staff data...");
        const { data, error } = await supabase
          .from("coaching_staff")
          .select("*")
          .order("name");
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Coaching staff data received:", data);
        if (data && data.length > 0) {
          setStaff(data as CoachingStaff[]);
        } else {
          // Use sample data if none exists in the database
          console.log("No coaching staff data found, using sample data");
          setStaff(sampleStaff);
          
          // Insert sample data into the database for first-time setup
          for (const member of sampleStaff) {
            const { error: insertError } = await supabase
              .from("coaching_staff")
              .insert({
                name: member.name,
                role: member.role,
                bio: member.bio,
                photo_url: member.photo_url,
                qualifications: member.qualifications,
                joined_year: member.joined_year
              });
              
            if (insertError) {
              console.error("Error inserting sample staff:", insertError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching coaching staff:", error);
        // Use sample data if there's an error
        setStaff(sampleStaff);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaff();
    
    // Set up subscription for real-time updates
    const staffSubscription = supabase
      .channel("coaching-staff-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "coaching_staff"
      }, () => {
        fetchStaff();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(staffSubscription);
    };
  }, []);
  
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
  
  const resetForm = () => {
    setStaffName("");
    setStaffRole("");
    setStaffBio("");
    setStaffQualifications("");
    setStaffSince("");
    setPhotoUrl("");
    setPhotoPreview(null);
    setIsEditing(false);
    setEditingStaff(null);
  };
  
  const handleEditStaff = (staff: CoachingStaff) => {
    setEditingStaff(staff);
    setStaffName(staff.name);
    setStaffRole(staff.role);
    setStaffBio(staff.bio || "");
    setStaffQualifications(staff.qualifications || "");
    setStaffSince(staff.joined_year || "");
    setPhotoUrl(staff.photo_url || "");
    setPhotoPreview(null);
    setIsEditing(true);
  };
  
  const handleAddOrUpdateStaff = async () => {
    if (!staffName || !staffRole) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and role",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log("Preparing staff data for save...");
      const staffData = {
        name: staffName,
        role: staffRole,
        bio: staffBio,
        photo_url: photoPreview || photoUrl,
        qualifications: staffQualifications,
        joined_year: staffSince
      };
      
      console.log("Staff data to save:", staffData);
      
      if (isEditing && editingStaff) {
        // Update existing staff
        console.log("Updating existing staff with ID:", editingStaff.id);
        const { error } = await supabase
          .from("coaching_staff")
          .update(staffData)
          .eq("id", editingStaff.id);
          
        if (error) {
          console.error("Error updating staff:", error);
          throw error;
        }
        
        toast({
          title: "Staff member updated",
          description: `${staffName}'s information has been updated`
        });
      } else {
        // Add new staff
        console.log("Adding new staff member");
        const { error } = await supabase
          .from("coaching_staff")
          .insert(staffData);
          
        if (error) {
          console.error("Error adding staff:", error);
          throw error;
        }
        
        toast({
          title: "Staff member added",
          description: `${staffName} has been added to the coaching staff`
        });
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error("Error saving coaching staff:", error);
      toast({
        title: "Error",
        description: "Failed to save coaching staff information",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteStaff = async (id: string, name: string) => {
    try {
      console.log("Deleting staff member with ID:", id);
      const { error } = await supabase
        .from("coaching_staff")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("Error deleting staff:", error);
        throw error;
      }
      
      // Update local state
      setStaff(prevStaff => prevStaff.filter(staff => staff.id !== id));
      
      toast({
        title: "Staff member removed",
        description: `${name} has been removed from the coaching staff`
      });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout title="Coaching Staff">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isAdmin() && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName">Name</Label>
                  <Input 
                    id="staffName" 
                    placeholder="Coach Name"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffRole">Role</Label>
                  <Input 
                    id="staffRole" 
                    placeholder="Head Coach, Assistant Coach, etc."
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffQualifications">Qualifications</Label>
                  <Input 
                    id="staffQualifications" 
                    placeholder="CAF A License, UEFA B License, etc."
                    value={staffQualifications}
                    onChange={(e) => setStaffQualifications(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffSince">Joined Year</Label>
                  <Input 
                    id="staffSince" 
                    placeholder="2020"
                    value={staffSince}
                    onChange={(e) => setStaffSince(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffBio">Biography</Label>
                  <Textarea 
                    id="staffBio" 
                    placeholder="Background information, achievements, etc."
                    value={staffBio}
                    onChange={(e) => setStaffBio(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Staff Photo</Label>
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
                    ) : photoUrl ? (
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => setPhotoUrl("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img 
                          src={photoUrl} 
                          alt="Staff" 
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
                            JPG, PNG or GIF.
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
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddOrUpdateStaff} 
                    className="flex-1 bg-tsfc-green hover:bg-tsfc-green/90"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : isEditing ? "Update Staff" : "Add Staff"}
                  </Button>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className={`md:col-span-${isAdmin() ? "2" : "3"}`}>
          <h2 className="text-xl font-semibold mb-4">Our Coaching Team</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading coaching staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-64 text-center">
              <User className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No coaching staff yet</h3>
              <p className="text-muted-foreground">Coaching staff information will be added soon</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {staff.map((staffMember) => (
                <Card key={staffMember.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 h-64 md:h-auto relative">
                      <img 
                        src={staffMember.photo_url || ""} 
                        alt={staffMember.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x400?text=Coach";
                        }}
                      />
                      {isAdmin() && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white hover:bg-gray-100"
                            onClick={() => handleEditStaff(staffMember)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteStaff(staffMember.id, staffMember.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold">{staffMember.name}</h3>
                        <p className="text-tsfc-green font-semibold">{staffMember.role}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>Since {staffMember.joined_year || "N/A"}</span>
                        </div>
                      </div>
                      
                      {staffMember.qualifications && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Qualifications</h4>
                          <p className="mt-1">{staffMember.qualifications}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Biography</h4>
                        <p className="mt-1 text-gray-600">{staffMember.bio || "No biography available."}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CoachingStaffPage;
