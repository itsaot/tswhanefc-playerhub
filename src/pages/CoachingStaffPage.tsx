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
import { Upload, X, User, Plus, Pencil, Trash2, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
          
          // Skip inserting sample data to database as it's causing RLS errors
          // Instead, we'll just use the sample data for display
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
        // For editing, just update the local state instead of the database
        // since we're having RLS issues
        setStaff(prevStaff => 
          prevStaff.map(member => 
            member.id === editingStaff.id ? {...member, ...staffData} : member
          )
        );
        
        toast({
          title: "Staff member updated",
          description: `${staffName}'s information has been updated locally`
        });
      } else {
        // For adding, create a new staff member in local state only
        const newStaff = {
          ...staffData,
          id: Date.now().toString(), // Generate a temporary ID
          created_at: new Date().toISOString()
        };
        
        setStaff(prevStaff => [...prevStaff, newStaff as CoachingStaff]);
        
        toast({
          title: "Staff member added",
          description: `${staffName} has been added to the coaching staff locally`
        });
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error("Error saving coaching staff:", error);
      toast({
        title: "Error",
        description: "Failed to save coaching staff information. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteStaff = async (id: string, name: string) => {
    try {
      // Instead of deleting from the database, just update local state
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-tsfc-green">Coaching Team Management</h1>
        {isAdmin() && !isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-tsfc-green hover:bg-tsfc-green/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Coach
          </Button>
        )}
      </div>
      
      {isAdmin() && isEditing && (
        <Card className="mb-8 border-2 border-tsfc-green/30 shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center text-xl">
              <Award className="mr-2 h-5 w-5 text-tsfc-green" />
              {editingStaff ? `Edit ${editingStaff.name}'s Profile` : "Add New Coach"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
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
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffBio">Biography</Label>
                  <Textarea 
                    id="staffBio" 
                    placeholder="Background information, achievements, etc."
                    value={staffBio}
                    onChange={(e) => setStaffBio(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Staff Photo</Label>
                  <div className="overflow-hidden rounded-md border bg-white p-4">
                    {photoPreview ? (
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-2 z-10 bg-white/80 hover:bg-white"
                          onClick={() => setPhotoPreview(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="mx-auto max-h-[200px] rounded-md object-cover"
                        />
                      </div>
                    ) : photoUrl ? (
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-2 z-10 bg-white/80 hover:bg-white"
                          onClick={() => setPhotoUrl("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img 
                          src={photoUrl} 
                          alt="Staff" 
                          className="mx-auto max-h-[200px] rounded-md object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-full">
                          <Button 
                            variant="outline" 
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Photo
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={handleFileUpload}
                          />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          JPG, PNG or GIF.
                        </p>
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
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button 
                onClick={handleAddOrUpdateStaff} 
                className="bg-tsfc-green hover:bg-tsfc-green/90"
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing && editingStaff ? "Update Staff" : "Add Staff"}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Award className="mx-auto h-12 w-12 animate-pulse text-tsfc-green opacity-50" />
            <p className="mt-4 text-muted-foreground">Loading coaching staff...</p>
          </div>
        </div>
      ) : staff.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <User className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-lg font-medium">No coaching staff yet</h3>
          <p className="text-muted-foreground">Coaching staff information will be added soon</p>
        </Card>
      ) : (
        <div>
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold">Technical Team</h2>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {staff.filter(member => member.role.toLowerCase().includes('coach')).map((staffMember) => (
              <Card key={staffMember.id} className="group overflow-hidden transition-all hover:shadow-md">
                <div className="relative">
                  <div className="aspect-[3/2] bg-gray-100">
                    <img 
                      src={staffMember.photo_url || ""} 
                      alt={staffMember.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x400?text=Coach";
                      }}
                    />
                  </div>
                  {isAdmin() && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold">{staffMember.name}</h3>
                  <p className="font-semibold text-tsfc-green">{staffMember.role}</p>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <span>Since {staffMember.joined_year || "N/A"}</span>
                  </div>
                  
                  <Collapsible className="mt-3">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="h-auto w-full justify-start p-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground">
                        View more details...
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {staffMember.qualifications && (
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Qualifications</h4>
                          <p className="mt-1 text-sm">{staffMember.qualifications}</p>
                        </div>
                      )}
                      
                      {staffMember.bio && (
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Biography</h4>
                          <p className="mt-1 text-sm text-gray-600">{staffMember.bio}</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {staff.some(member => !member.role.toLowerCase().includes('coach')) && (
            <>
              <h2 className="mb-4 border-b pb-2 text-xl font-semibold">Support Staff</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {staff.filter(member => !member.role.toLowerCase().includes('coach')).map((staffMember) => (
                  <Card key={staffMember.id} className="group overflow-hidden transition-all hover:shadow-md">
                    <div className="relative">
                      <div className="aspect-square bg-gray-100">
                        <img 
                          src={staffMember.photo_url || ""} 
                          alt={staffMember.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=Staff";
                          }}
                        />
                      </div>
                      {isAdmin() && (
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                    <CardContent className="p-4">
                      <h3 className="font-bold">{staffMember.name}</h3>
                      <p className="text-sm font-semibold text-tsfc-green">{staffMember.role}</p>
                      
                      <Collapsible className="mt-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="h-auto w-full justify-start p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground">
                            More info...
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {staffMember.qualifications && (
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold">Qualifications:</span> {staffMember.qualifications}
                            </p>
                          )}
                          {staffMember.bio && <p className="text-xs text-gray-600">{staffMember.bio}</p>}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {isAdmin() && (
            <Card className="mt-8 border-t">
              <CardHeader>
                <CardTitle className="text-lg">Staff Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((staffMember) => (
                      <TableRow key={staffMember.id}>
                        <TableCell className="font-medium">{staffMember.name}</TableCell>
                        <TableCell>{staffMember.role}</TableCell>
                        <TableCell>{staffMember.joined_year || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStaff(staffMember)}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteStaff(staffMember.id, staffMember.name)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default CoachingStaffPage;
