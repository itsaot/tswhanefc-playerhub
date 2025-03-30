import { useState, useEffect } from "react";

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

const samplePlayers: Player[] = [
  {
    id: "1",
    name: "Thabo",
    surname: "Mokoena",
    age: 23,
    preferredFoot: "Right",
    idNumber: "9812125678083",
    dateOfBirth: "1998-12-12",
    race: "Black",
    nationality: "South African",
    safaId: "SAFA12345",
    photoUrl: "https://i.pravatar.cc/300?img=1",
    dateJoined: "2021-02-15",
    registrationStatus: "Registered",
    position: "Striker",
    height: "185 cm",
    weight: "75 kg",
    category: "Senior",
    emergencyContact: "+27 71 234 5678",
    medicalConditions: "None",
  },
  {
    id: "2",
    name: "Sipho",
    surname: "Mbatha",
    age: 19,
    preferredFoot: "Left",
    idNumber: "0305125678083",
    dateOfBirth: "2003-05-12",
    race: "Black",
    nationality: "South African",
    safaId: "SAFA23456",
    photoUrl: "https://i.pravatar.cc/300?img=2",
    dateJoined: "2022-01-10",
    registrationStatus: "Registered",
    position: "Midfielder",
    height: "175 cm",
    weight: "68 kg",
    category: "Senior",
    emergencyContact: "+27 82 345 6789",
    medicalConditions: "Asthma",
  },
  {
    id: "3",
    name: "Lerato",
    surname: "Molefe",
    age: 16,
    preferredFoot: "Right",
    idNumber: "0610085678083",
    dateOfBirth: "2006-10-08",
    race: "Black",
    nationality: "South African",
    safaId: "SAFA34567",
    photoUrl: "https://i.pravatar.cc/300?img=3",
    dateJoined: "2022-03-05",
    registrationStatus: "Pending",
    position: "Defender",
    height: "178 cm",
    weight: "65 kg",
    category: "Junior",
    emergencyContact: "+27 73 456 7890",
    medicalConditions: "None",
  },
  {
    id: "4",
    name: "John",
    surname: "Smith",
    age: 17,
    preferredFoot: "Both",
    idNumber: "0512155678083",
    dateOfBirth: "2005-12-15",
    race: "White",
    nationality: "South African",
    safaId: "SAFA45678",
    photoUrl: "https://i.pravatar.cc/300?img=4",
    dateJoined: "2021-08-20",
    registrationStatus: "Registered",
    position: "Goalkeeper",
    height: "190 cm",
    weight: "80 kg",
    category: "Junior",
    emergencyContact: "+27 84 567 8901",
    medicalConditions: "None",
  },
];

export const usePlayerData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      } else {
        setPlayers(samplePlayers);
        localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(samplePlayers));
      }
    } catch (err) {
      setError("Failed to load player data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAYERS_STORAGE_KEY && e.newValue) {
        setPlayers(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (players.length > 0 && !loading) {
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, loading]);

  const addPlayer = (playerData: Partial<Omit<Player, "id">>) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
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
    
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    return newPlayer;
  };

  const updatePlayer = (id: string, updatedData: Partial<Player>) => {
    const updatedPlayers = players.map(player => 
      player.id === id ? { ...player, ...updatedData } : player
    );
    setPlayers(updatedPlayers);
  };

  const deletePlayer = (id: string) => {
    const updatedPlayers = players.filter(player => player.id !== id);
    setPlayers(updatedPlayers);
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

  const importFromCSV = (csvText: string) => {
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
              player[header.trim().toLowerCase().replace(/\s+/g, '')] = values[index];
          }
        });
        
        importedPlayers.push(player as Player);
      }
      
      setPlayers(importedPlayers);
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
