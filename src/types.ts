export interface Workshop {
  id: number;
  title: string;
  instructor: string;
  location: string;
  time_slot: '1ª Oficina' | '2ª Oficina' | 'Geral';
  max_slots: number;
}

export interface City {
  id: number;
  name: string;
}

export interface Oficineiro {
  id: number;
  username: string;
  workshop_id: number | null;
  workshop_title?: string | null;
}

export interface Participant {
  id: number;
  name: string;
  city: string;
  city_id?: number | null;
  family_group: string;
  workshop1_id?: number | null;
  workshop2_id?: number | null;
  workshop1_title?: string;
  workshop2_title?: string;
  attendance1_status?: 'PRESENTE' | 'FALTA' | 'PENDENTE';
  attendance2_status?: 'PRESENTE' | 'FALTA' | 'PENDENTE';
}

export interface AttendanceRecord {
  id?: number;
  participant_id: number;
  workshop_id: number;
  status: 'PRESENTE' | 'FALTA';
  marked_at?: string;
}

export interface SurveyResponse {
  id?: number;
  pre_study_rating: number; // 1 to 5
  pre_study_comment?: string;
  marketing_rating: number; // 1 to 5
  marketing_comment?: string;
  welcome_rating: number;
  checkin_rating: number;
  
  // Infrastructure
  infra_accommodation: number;
  infra_breakfast: number;
  infra_lunch: number;
  infra_dinner: number;
  infra_restrooms: number;
  infra_tech: number;
  infra_lodging_used: boolean;
  infra_lodging_rating?: number;

  // Workshops
  workshop1_id?: number;
  workshop1_rating: number;
  workshop2_id?: number;
  workshop2_rating: number;

  // Moments
  youth_moment_rating: number; // Momento Jovem
  mirim_moment_rating: number; // Momento MFC Mirim
  animation_rating: number;
  mass_rating: number;
  liturgy_rating: number; // Liturgias (orações)
  eco_friendly_rating: number; // Respeito aos recursos naturais

  // Final & Recommendation
  recommendation_text?: string;
  recommendation_nps: number; // 0 to 10
  general_suggestions?: string;
  created_at?: string;
}

export interface SurveyAverages {
  total_surveys: number;
  avg_overall_score: number;
  nps_score: number;
  averages: {
    pre_study: number;
    marketing: number;
    welcome: number;
    checkin: number;
    infra_accommodation: number;
    infra_breakfast: number;
    infra_lunch: number;
    infra_dinner: number;
    infra_restrooms: number;
    infra_tech: number;
    infra_lodging: number;
    youth_moment: number;
    mirim_moment: number;
    animation: number;
    mass: number;
    liturgy: number;
    eco_friendly: number;
  };
  workshop_ratings: {
    workshop_id: number;
    workshop_title: string;
    avg_rating: number;
    total_votes: number;
  }[];
  recent_testimonials: {
    text: string;
    nps: number;
    date: string;
  }[];
  recent_suggestions: {
    text: string;
    date: string;
  }[];
}

export interface SystemStats {
  total_participants: number;
  total_workshops: number;
  total_surveys: number;
  total_present: number;
  total_absent: number;
  nps_score: number;
}
