
/**
 * Utility functions for exporting data to CSV
 */

/**
 * Exports user login details to CSV
 */
export const exportUsersToCSV = () => {
  try {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (users.length === 0) {
      console.warn("No users to export");
      return false;
    }
    
    // Create CSV headers
    const headers = ["Username", "Role", "Registration Date"];
    
    // Create CSV rows
    const rows = users.map((user: any) => [
      user.username,
      user.role,
      user.registrationDate || "N/A"
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tsfc_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    
    // Trigger download and clean up
    link.click();
    document.body.removeChild(link);
    console.log("Users exported to CSV successfully");
    return true;
  } catch (error) {
    console.error("Error exporting users to CSV:", error);
    return false;
  }
};
