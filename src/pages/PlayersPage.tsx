
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { usePlayerData } from "../hooks/usePlayerData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, MoreHorizontal, FileDown, Upload } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";

const PlayersPage = () => {
  const { players, deletePlayer, exportToCSV, importFromCSV } = usePlayerData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const isAdmin = user.role === "admin";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importFromCSV(content);
      
      if (success) {
        toast({
          title: "Import Successful",
          description: "Player data has been imported from CSV",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import player data. Check file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Filter players based on search term and category
  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.idNumber.includes(searchTerm) ||
      player.safaId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "All" || 
      player.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout title="Players">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, ID, or SAFA ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Players</SelectItem>
                  <SelectItem value="Senior">Senior Players</SelectItem>
                  <SelectItem value="Junior">Junior Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={exportToCSV}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-md shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>SAFA ID</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={player.photoUrl || "https://i.pravatar.cc/100?img=" + player.id} 
                            alt={`${player.name} ${player.surname}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{player.name} {player.surname}</div>
                          <div className="text-sm text-muted-foreground">{player.nationality}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{player.age}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        player.category === "Senior" 
                          ? "bg-tsfc-green/10 text-tsfc-green" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {player.category}
                      </span>
                    </TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.safaId}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        player.registrationStatus === "Registered" 
                          ? "bg-green-100 text-green-800" 
                          : player.registrationStatus === "Pending" 
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {player.registrationStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/players/${player.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link to={`/players/${player.id}/edit`}>Edit Player</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this player?")) {
                                    deletePlayer(player.id);
                                    toast({
                                      title: "Player Deleted",
                                      description: `${player.name} ${player.surname} has been removed from the system`,
                                    });
                                  }
                                }}
                              >
                                Delete Player
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No players found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlayersPage;
