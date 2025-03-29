
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { usePlayerData } from "../hooks/usePlayerData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, Calendar, FileText, Medal, Star, User2 } from "lucide-react";

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlayerById } = usePlayerData();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isAdmin = user.role === "admin";

  const player = getPlayerById(id || "");

  if (!player) {
    return (
      <MainLayout title="Player Not Found">
        <div className="text-center">
          <p className="text-lg mb-4">The player you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/players")}>Back to Players</Button>
        </div>
      </MainLayout>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <MainLayout title={`${player.name} ${player.surname}`}>
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/players")}
        >
          Back to Players
        </Button>
        {isAdmin && (
          <Button
            onClick={() => navigate(`/players/${id}/edit`)}
          >
            Edit Player
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-tsfc-green">
                <img 
                  src={player.photoUrl || "https://i.pravatar.cc/300?img=" + player.id} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold">{player.name} {player.surname}</h2>
              <p className="text-gray-600">{player.position}</p>
              
              <div className="mt-4 flex justify-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.category === "Senior" 
                    ? "bg-tsfc-green/10 text-tsfc-green" 
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {player.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.registrationStatus === "Registered" 
                    ? "bg-green-100 text-green-800" 
                    : player.registrationStatus === "Pending" 
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}>
                  {player.registrationStatus}
                </span>
              </div>
              
              <div className="mt-6 text-left">
                <h3 className="font-semibold mb-2 text-tsfc-green">Player Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Age:</div>
                  <div>{player.age} years</div>
                  
                  <div className="text-gray-600">Nationality:</div>
                  <div>{player.nationality}</div>
                  
                  <div className="text-gray-600">Preferred Foot:</div>
                  <div>{player.preferredFoot}</div>
                  
                  <div className="text-gray-600">Height:</div>
                  <div>{player.height}</div>
                  
                  <div className="text-gray-600">Weight:</div>
                  <div>{player.weight}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">
                <User2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="registration">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Registration</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="medical">
                <UserCog className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Medical</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p>{player.name} {player.surname}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                        <p>{player.idNumber}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                        <p>{new Date(player.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Age</h3>
                        <p>{calculateAge(player.dateOfBirth)} years</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Race</h3>
                        <p>{player.race}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
                        <p>{player.nationality}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                        <p>{player.emergencyContact}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Player Category</h3>
                        <p>{player.category}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="registration">
              <Card>
                <CardHeader>
                  <CardTitle>Registration Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">SAFA ID</h3>
                        <p>{player.safaId}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Date Joined</h3>
                        <p>{new Date(player.dateJoined).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Registration Status</h3>
                        <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          player.registrationStatus === "Registered" 
                            ? "bg-green-100 text-green-800" 
                            : player.registrationStatus === "Pending" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                          {player.registrationStatus}
                        </p>
                      </div>
                      {player.registrationStatus === "Registered" && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                          <p>January 15, 2022</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Player History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Medal className="h-5 w-5 text-tsfc-green" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">League Champions 2020/2021</h3>
                        <p className="text-sm text-gray-500">Part of the winning squad that secured promotion playoffs.</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Star className="h-5 w-5 text-tsfc-green" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">Joined Tshwane Sporting FC</h3>
                        <p className="text-sm text-gray-500">Became part of the team on {new Date(player.dateJoined).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Medical Conditions</h3>
                      <p>{player.medicalConditions || "None"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Emergency Contact</h3>
                      <p>{player.emergencyContact}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Blood Type</h3>
                      <p>Not specified</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Allergies</h3>
                      <p>None reported</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlayerDetailsPage;
