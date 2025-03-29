
import MainLayout from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayerData } from "../hooks/usePlayerData";
import { Users, UserCheck, Medal, Calendar, Facebook } from "lucide-react";

const Dashboard = () => {
  const { players } = usePlayerData();

  const seniorPlayers = players.filter(player => player.age >= 18);
  const juniorPlayers = players.filter(player => player.age < 18);
  const registeredPlayers = players.filter(player => player.registrationStatus === "Registered");

  return (
    <MainLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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

      <div className="mt-8">
        <Card>
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
      </div>
    </MainLayout>
  );
};

export default Dashboard;
