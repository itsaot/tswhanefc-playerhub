
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type Player = {
  id: string;
  name: string;
  surname: string;
  age: number;
  preferredFoot: "Left" | "Right" | "Both";
  idNumber: string;
  dateOfBirth: string;
  race: string;
  nationality: string;
  safaId: string;
  photoUrl: string;
  dateJoined: string;
  registrationStatus: "Registered" | "Pending" | "Not Registered";
  position: string;
  height: string;
  weight: string;
  category: "Senior" | "Junior";
  emergencyContact: string;
  medicalConditions: string;
};

const PLAYERS_STORAGE_KEY = "players";

export const usePlayerData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load players from Supabase on initial load
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*");

        if (error) {
          console.error("Error fetching players:", error);
          setError("Failed to load player data from the database");
          // Fallback to localStorage if Supabase fails
          const storedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
          if (storedPlayers) {
            setPlayers(JSON.parse(storedPlayers));
          }
        } else if (data && data.length > 0) {
          // Transform Supabase data format to match our app's format
          const formattedPlayers = data.map(player => ({
            id: player.id,
            name: player.name,
            surname: player.surname,
            age: player.age,
            preferredFoot: player.preferred_foot as "Left" | "Right" | "Both",
            idNumber: player.id_number,
            dateOfBirth: player.date_of_birth,
            race: player.race,
            nationality: player.nationality,
            safaId: player.safa_id || "",
            photoUrl: player.photo_url || "",
            dateJoined: player.date_joined,
            registrationStatus: player.registration_status as "Registered" | "Pending" | "Not Registered",
            position: player.position,
            height: player.height || "",
            weight: player.weight || "",
            category: player.category as "Senior" | "Junior",
            emergencyContact: player.emergency_contact || "",
            medicalConditions: player.medical_conditions || "",
          }));
          setPlayers(formattedPlayers);
          
          // Backup to localStorage
          localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(formattedPlayers));
        } else {
          // If no data in Supabase yet, check localStorage for initial data
          const storedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
          if (storedPlayers) {
            const parsedPlayers = JSON.parse(storedPlayers);
            setPlayers(parsedPlayers);
            
            // Migrate localStorage data to Supabase
            parsedPlayers.forEach(async (player: Player) => {
              await addPlayerToSupabase(player);
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch players:", err);
        setError("Failed to load player data");
        
        // Fallback to localStorage
        const storedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
        if (storedPlayers) {
          setPlayers(JSON.parse(storedPlayers));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
    
    // Subscribe to realtime changes
    const playersSubscription = supabase
      .channel('players-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'players' 
      }, (payload) => {
        // Refresh the players list when changes occur
        fetchPlayers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(playersSubscription);
    };
  }, []);

  // Converts a Player object to the format expected by Supabase
  const playerToDbFormat = (player: Player) => {
    return {
      name: player.name,
      surname: player.surname,
      age: player.age,
      preferred_foot: player.preferredFoot,
      id_number: player.idNumber,
      date_of_birth: player.dateOfBirth,
      race: player.race,
      nationality: player.nationality,
      safa_id: player.safaId,
      photo_url: player.photoUrl,
      date_joined: player.dateJoined,
      registration_status: player.registrationStatus,
      position: player.position,
      height: player.height,
      weight: player.weight,
      category: player.category,
      emergency_contact: player.emergencyContact,
      medical_conditions: player.medicalConditions,
    };
  };

  // Function to add a player to Supabase
  const addPlayerToSupabase = async (playerData: Player) => {
    try {
      const dbFormatPlayer = playerToDbFormat(playerData);
      
      const { data, error } = await supabase
        .from('players')
        .insert(dbFormatPlayer)
        .select();
        
      if (error) {
        console.error("Error adding player to Supabase:", error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (err) {
      console.error("Failed to add player to Supabase:", err);
      return null;
    }
  };

  const addPlayer = async (playerData: Partial<Omit<Player, "id">>) => {
    const newPlayer: Player = {
      id: Date.now().toString(), // This will be replaced by Supabase's UUID
      name: playerData.name || "",
      surname: playerData.surname || "",
      age: playerData.age || 0,
      preferredFoot: playerData.preferredFoot || "Right",
      idNumber: playerData.idNumber || "",
      dateOfBirth: playerData.dateOfBirth || "",
      race: playerData.race || "",
      nationality: playerData.nationality || "",
      safaId: playerData.safaId || "",
      photoUrl: playerData.photoUrl || "",
      dateJoined: playerData.dateJoined || new Date().toISOString().split('T')[0],
      registrationStatus: playerData.registrationStatus || "Pending",
      position: playerData.position || "",
      height: playerData.height || "",
      weight: playerData.weight || "",
      category: playerData.category || "Senior",
      emergencyContact: playerData.emergencyContact || "",
      medicalConditions: playerData.medicalConditions || "",
    };
    
    try {
      // Add to Supabase first
      const dbFormatPlayer = playerToDbFormat(newPlayer);
      
      const { data, error } = await supabase
        .from('players')
        .insert(dbFormatPlayer)
        .select();
        
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data[0]) {
        // If successful, update the player with the Supabase ID
        const supabasePlayer = data[0];
        const formattedPlayer: Player = {
          ...newPlayer,
          id: supabasePlayer.id,
        };
        
        // Update local state
        const updatedPlayers = [...players, formattedPlayer];
        setPlayers(updatedPlayers);
        
        // Update localStorage as backup
        localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
        
        return formattedPlayer;
      }
      
      // Fallback to local-only if Supabase insert fails but doesn't throw an error
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
      return newPlayer;
      
    } catch (err) {
      console.error("Error adding player:", err);
      toast({
        title: "Error adding player",
        description: "The player couldn't be saved to the database. Added locally only.",
        variant: "destructive"
      });
      
      // Fallback to local-only
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
      return newPlayer;
    }
  };

  const updatePlayer = async (id: string, updatedData: Partial<Player>) => {
    try {
      // Convert to database format (snake_case)
      const dbUpdates: Record<string, any> = {};
      
      // Only include fields that are being updated
      Object.entries(updatedData).forEach(([key, value]) => {
        // Convert camelCase to snake_case
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        dbUpdates[dbKey] = value;
      });
      
      // Update in Supabase
      const { error } = await supabase
        .from('players')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      const updatedPlayers = players.map(player => 
        player.id === id ? { ...player, ...updatedData } : player
      );
      
      setPlayers(updatedPlayers);
      
      // Update localStorage as backup
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
    } catch (err) {
      console.error("Error updating player:", err);
      toast({
        title: "Error updating player",
        description: "Changes couldn't be saved to the database but were saved locally.",
        variant: "destructive"
      });
      
      // Fallback to local-only update
      const updatedPlayers = players.map(player => 
        player.id === id ? { ...player, ...updatedData } : player
      );
      setPlayers(updatedPlayers);
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      const updatedPlayers = players.filter(player => player.id !== id);
      setPlayers(updatedPlayers);
      
      // Update localStorage as backup
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
    } catch (err) {
      console.error("Error deleting player:", err);
      toast({
        title: "Error deleting player",
        description: "The player couldn't be deleted from the database but was removed locally.",
        variant: "destructive"
      });
      
      // Fallback to local-only delete
      const updatedPlayers = players.filter(player => player.id !== id);
      setPlayers(updatedPlayers);
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(updatedPlayers));
    }
  };

  const getPlayerById = (id: string) => {
    return players.find(player => player.id === id);
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Name", "Surname", "Age", "Preferred Foot", "ID Number", 
      "Date of Birth", "Race", "Nationality", "SAFA ID", "Photo URL", 
      "Date Joined", "Registration Status", "Position", "Height", "Weight", 
      "Category", "Emergency Contact", "Medical Conditions"
    ];
    
    const rows = players.map(player => [
      player.id,
      player.name,
      player.surname,
      player.age.toString(),
      player.preferredFoot,
      player.idNumber,
      player.dateOfBirth,
      player.race,
      player.nationality,
      player.safaId,
      player.photoUrl,
      player.dateJoined,
      player.registrationStatus,
      player.position,
      player.height,
      player.weight,
      player.category,
      player.emergencyContact,
      player.medicalConditions
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tshwane_sporting_fc_players.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = async (csvText: string) => {
    try {
      const lines = csvText.split("\n");
      const headers = lines[0].split(",");
      
      const importedPlayers: Player[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(",");
        const player: any = {};
        
        headers.forEach((header, index) => {
          switch(header.trim()) {
            case "Age":
              player.age = parseInt(values[index], 10);
              break;
            default:
              // Convert header to camelCase for our app's data format
              const camelHeader = header.trim().toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()
              ).replace(/\s+/g, '');
              player[camelHeader] = values[index];
          }
        });
        
        importedPlayers.push(player as Player);
      }
      
      // Add each player to Supabase
      const promises = importedPlayers.map(async (player) => {
        const dbPlayer = playerToDbFormat(player);
        return supabase.from('players').insert(dbPlayer);
      });
      
      await Promise.all(promises);
      
      // Refresh players from Supabase
      const { data, error } = await supabase
        .from("players")
        .select("*");
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform Supabase data format to match our app's format
        const formattedPlayers = data.map(player => ({
          id: player.id,
          name: player.name,
          surname: player.surname,
          age: player.age,
          preferredFoot: player.preferred_foot as "Left" | "Right" | "Both",
          idNumber: player.id_number,
          dateOfBirth: player.date_of_birth,
          race: player.race,
          nationality: player.nationality,
          safaId: player.safa_id || "",
          photoUrl: player.photo_url || "",
          dateJoined: player.date_joined,
          registrationStatus: player.registration_status as "Registered" | "Pending" | "Not Registered",
          position: player.position,
          height: player.height || "",
          weight: player.weight || "",
          category: player.category as "Senior" | "Junior",
          emergencyContact: player.emergency_contact || "",
          medicalConditions: player.medical_conditions || "",
        }));
        
        setPlayers(formattedPlayers);
        localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(formattedPlayers));
      }
      
      return true;
    } catch (err) {
      console.error("Error importing CSV:", err);
      setError("Failed to import CSV file. Check the format and try again.");
      return false;
    }
  };

  return {
    players,
    loading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerById,
    exportToCSV,
    importFromCSV
  };
};
