import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const routes = {
    message: "Sprint Capacity Planner API Routes",
    baseUrl: "https://sprint-capacity-planner.vercel.app",
    endpoints: {
      health: {
        path: "/health",
        method: "GET",
        description: "Health check endpoint"
      },
      sprints: {
        base: "/sprints",
        endpoints: [
          { method: "GET", path: "/sprints", description: "Get all sprints with pagination" },
          { method: "POST", path: "/sprints", description: "Create a new sprint" },
          { method: "GET", path: "/sprints/:id", description: "Get sprint by ID" },
          { method: "PATCH", path: "/sprints/:id", description: "Update sprint by ID" },
          { method: "DELETE", path: "/sprints/:id", description: "Delete sprint by ID" },
          { method: "GET", path: "/sprints/working-days", description: "Calculate working days between dates" },
          { method: "GET", path: "/sprints/:id/working-days", description: "Calculate working days for a sprint" },
          { method: "POST", path: "/sprints/:id/calculate-projected-velocity", description: "Calculate projected velocity" },
          { method: "GET", path: "/sprints/:id/team-members", description: "Get team members assigned to sprint" },
          { method: "PUT", path: "/sprints/:id/team-member-capacities", description: "Update team member capacities" },
          { method: "POST", path: "/sprints/:id/assign-team-member", description: "Assign team member to sprint" },
          { method: "DELETE", path: "/sprints/:id/team-members/:memberId", description: "Remove team member from sprint" }
        ]
      },
      teamMembers: {
        base: "/team-members",
        endpoints: [
          { method: "GET", path: "/team-members", description: "Get all team members" },
          { method: "POST", path: "/team-members", description: "Create a new team member" },
          { method: "GET", path: "/team-members/:id", description: "Get team member by ID" },
          { method: "PATCH", path: "/team-members/:id", description: "Update team member by ID" },
          { method: "DELETE", path: "/team-members/:id", description: "Delete team member by ID" },
          { method: "GET", path: "/team-members/skills", description: "Get all available skills" }
        ]
      }
    },
    examples: {
      "Get all sprints": "GET /sprints?page=1&limit=10",
      "Calculate working days": "GET /sprints/working-days?startDate=2025-08-03&endDate=2025-08-17",
      "Get all team members": "GET /team-members",
      "Get available skills": "GET /team-members/skills"
    }
  };

  res.status(200).json(routes);
};