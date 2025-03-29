
import MainLayout from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayerData } from "../hooks/usePlayerData";
import { Users, UserCheck, Medal, Calendar, Facebook, Camera, Trophy } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const Dashboard = () => {
  const { players } = usePlayerData();
  const { user } = useContext(UserContext);

  const seniorPlayers = players.filter(player => player.age >= 18);
  const juniorPlayers = players.filter(player => player.age < 18);
  const registeredPlayers = players.filter(player => player.registrationStatus === "Registered");

  // Football images for the carousel
  const footballImages = [
    {
      url: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Training Session"
    },
    {
      url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Match Day"
    },
    {
      url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Team Spirit"
    },
    {
      url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Championship Game"
    }
  ];

  return (
    <MainLayout title="Dashboard">
      {/* Welcome card with animation */}
      <Card className="mb-6 overflow-hidden relative border-t-4 border-t-tsfc-green">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-tsfc-green/10 z-0 animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 rounded-full bg-tsfc-green/10 z-0 animate-[pulse_6s_ease-in-out_infinite_1s]"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-tsfc-green/10 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-tsfc-green animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user.username}!</h2>
              <p className="text-gray-600">
                This is your Tshwane Sporting FC dashboard. Access player information, view club photos, 
                and manage team data all in one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-5 w-5 text-tsfc-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current squad size
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "100ms"}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Senior Players</CardTitle>
            <Medal className="h-5 w-5 text-tsfc-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{seniorPlayers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Players aged 18+
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "200ms"}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Junior Players</CardTitle>
            <Calendar className="h-5 w-5 text-tsfc-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{juniorPlayers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Players under 18
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "300ms"}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
            <UserCheck className="h-5 w-5 text-tsfc-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{registeredPlayers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Players with completed registration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Football images carousel */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2 text-tsfc-green" />
            Football Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <Carousel className="w-full">
            <CarouselContent>
              {footballImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img 
                          src={image.url} 
                          alt={image.title} 
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{image.title}</h3>
                      </CardContent>
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
          <div className="text-center mt-4">
            <Link to="/photos" className="text-tsfc-green hover:underline inline-flex items-center">
              <Camera className="h-4 w-4 mr-1" />
              View all club photos
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Club info */}
      <Card className="animate-fade-in" style={{animationDelay: "400ms"}}>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About Tshwane Sporting FC</h3>
            <p className="text-gray-600">
              Tshwane Sporting FC, nicknamed "The Cyclones", was founded in 2020 at the SAPS Training college 
              by Coach Jomo. The club achieved immediate success by winning the league in their first year of 
              participation, though they were unfortunately knocked out at the promotions games.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Club Achievements</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>League Champions (2020)</li>
              <li>Promotion Playoffs Qualification (2020)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Training Grounds</h3>
            <p className="text-gray-600">
              The team currently trains at the SAPS Training College grounds, which has become 
              the home base for all club activities and matches.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="https://web.facebook.com/p/Tshwane-Sporting-FC-100085997681102/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-tsfc-green hover:underline"
            >
              <Facebook className="mr-2 h-5 w-5" />
              Visit our Facebook page for the latest news and updates
            </a>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
