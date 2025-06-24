// Field Tracker - Corporate Color Palette
// Based on client's corporate colors: White, Red, Black

export const Colors = {
  // Primary Corporate Colors
  white: '#FFFFFF',
  red: '#DC2626', 
  black: '#1F2937',
  
  // Variations for UI hierarchy
  background: '#FFFFFF',        // Main background
  primary: '#DC2626',          // Primary actions, active states
  text: '#1F2937',             // Primary text
  textSecondary: '#6B7280',    // Secondary text
  
  // Status Colors (using red variations to stay corporate)
  success: '#10B981',          // Approved jobs
  warning: '#F59E0B',          // In Progress
  info: '#3B82F6',             // Submitted
  danger: '#DC2626',           // Rejected, errors
  
  // UI Elements
  border: '#E5E7EB',           // Light borders
  cardBackground: '#F9FAFB',   // Card backgrounds
  disabled: '#9CA3AF',         // Disabled states
  
  // Status variations using corporate colors
  status: {
    created: '#6B7280',        // Gray for created
    inProgress: '#F59E0B',     // Orange for working
    completed: '#DC2626',      // Red for completed (corporate)
    submitted: '#3B82F6',      // Blue for submitted
    approved: '#10B981',       // Green for approved
    rejected: '#DC2626',       // Red for rejected (corporate)
  },
  
  // Role-based colors
  tech: '#DC2626',             // Red for technician (corporate)
  boss: '#1F2937',             // Black for manager (corporate)
  
  // Transparency overlays
  overlay: 'rgba(31, 41, 55, 0.5)',  // Black overlay
  redOverlay: 'rgba(220, 38, 38, 0.1)', // Light red background
};