import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { usePlayerData, Player } from "../hooks/usePlayerData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const playerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  idNumber: z.string().min(5, { message: "ID number is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  age: z.number().min(8, { message: "Age must be at least 8" }).max(50, { message: "Age must be less than 50" }),
  preferredFoot: z.enum(["Left", "Right", "Both"], { 
    required_error: "Please select a preferred foot" 
  }),
  race: z.string().min(1, { message: "Race is required" }),
  nationality: z.string().min(1, { message: "Nationality is required" }),
  safaId: z.string().optional().transform(val => val || ""),
  photoUrl: z.string().optional().transform(val => val || ""),
  registrationStatus: z.enum(["Registered", "Pending", "Not Registered"], { 
    required_error: "Please select a registration status" 
  }),
  position: z.string().min(1, { message: "Position is required" }),
  height: z.string().min(1, { message: "Height is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  category: z.enum(["Senior", "Junior"], { 
    required_error: "Please select a category" 
  }),
  emergencyContact: z.string().min(1, { message: "Emergency contact is required" }),
  medicalConditions: z.string().optional().transform(val => val || ""),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const RegisterPlayerPage = () => {
  const { addPlayer } = usePlayerData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      surname: "",
      idNumber: "",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      age: 18,
      preferredFoot: "Right",
      race: "",
      nationality: "South African",
      safaId: "",
      photoUrl: "",
      registrationStatus: "Pending",
      position: "",
      height: "",
      weight: "",
      category: "Senior",
      emergencyContact: "",
      medicalConditions: "",
    },
  });

  const onSubmit = (values: PlayerFormValues) => {
    const playerData = {
      name: values.name,
      surname: values.surname,
      age: values.age,
      preferredFoot: values.preferredFoot,
      idNumber: values.idNumber,
      dateOfBirth: values.dateOfBirth,
      race: values.race,
      nationality: values.nationality,
      safaId: values.safaId || "",
      photoUrl: photoPreview || values.photoUrl || "",
      dateJoined: format(new Date(), "yyyy-MM-dd"),
      registrationStatus: values.registrationStatus,
      position: values.position,
      height: values.height,
      weight: values.weight,
      category: values.category,
      emergencyContact: values.emergencyContact,
      medicalConditions: values.medicalConditions || "",
    };

    const newPlayer = addPlayer(playerData);
    
    toast({
      title: "Player registered successfully",
      description: `${values.name} ${values.surname} has been added to the system.`,
    });
    
    navigate(`/players/${newPlayer.id}`);
  };

  const handleDateOfBirthChange = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    form.setValue("age", age);
    
    if (age < 18) {
      form.setValue("category", "Junior");
    } else {
      form.setValue("category", "Senior");
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <MainLayout title="Register New Player">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/players")}
        >
          Back to Players
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Registration Form</CardTitle>
          <CardDescription>
            Enter the player's details to add them to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="physical">Physical Info</TabsTrigger>
                  <TabsTrigger value="registration">Registration</TabsTrigger>
                  <TabsTrigger value="medical">Medical Info</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surname</FormLabel>
                          <FormControl>
                            <Input placeholder="Surname" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input placeholder="ID number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                handleDateOfBirthChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => {
                                const age = parseInt(e.target.value);
                                field.onChange(age);
                                
                                if (age < 18) {
                                  form.setValue("category", "Junior");
                                } else {
                                  form.setValue("category", "Senior");
                                }
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Senior">Senior</SelectItem>
                              <SelectItem value="Junior">Junior</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Automatically set based on age
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="race"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race</FormLabel>
                          <FormControl>
                            <Input placeholder="Race" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input placeholder="Nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border p-4 rounded-md">
                    <div className="mb-4">
                      <Label htmlFor="photo-upload">Player Photo</Label>
                      <div className="mt-2 flex items-center">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex justify-center items-center border">
                          {photoPreview ? (
                            <img 
                              src={photoPreview} 
                              alt="Player preview" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Upload className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-5">
                          <div className="relative">
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handlePhotoUpload}
                            />
                            <Button type="button" variant="outline">
                              Upload Photo
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            JPG, PNG or GIF. 1MB max size.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or enter image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/player.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Direct link to player's photo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="physical" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Striker" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredFoot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Foot</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred foot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Left">Left</SelectItem>
                              <SelectItem value="Right">Right</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 182 cm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 75 kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="registration" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="safaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAFA ID</FormLabel>
                          <FormControl>
                            <Input placeholder="SAFA ID number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Official SAFA registration ID if available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Registered">Registered</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Not Registered">Not Registered</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Contact person in case of emergency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any medical conditions, allergies, or medications" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Leave blank if none
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <CardFooter className="border-t pt-6 px-0">
                <div className="flex justify-between w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/players")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-tsfc-green hover:bg-tsfc-green/90">
                    Register Player
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default RegisterPlayerPage;
