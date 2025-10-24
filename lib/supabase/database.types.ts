export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          school_name: string | null
          grade: number | null
          target_major: string | null
          target_universities: string[] | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          school_name?: string | null
          grade?: number | null
          target_major?: string | null
          target_universities?: string[] | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          school_name?: string | null
          grade?: number | null
          target_major?: string | null
          target_universities?: string[] | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      school_records: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          grade: number | null
          semester: number | null
          subject: string | null
          image_url: string | null
          ocr_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          grade?: number | null
          semester?: number | null
          subject?: string | null
          image_url?: string | null
          ocr_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          grade?: number | null
          semester?: number | null
          subject?: string | null
          image_url?: string | null
          ocr_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          user_id: string
          school_record_id: string | null
          analysis_type: string
          input_text: string
          result: Json
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_record_id?: string | null
          analysis_type: string
          input_text: string
          result: Json
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_record_id?: string | null
          analysis_type?: string
          input_text?: string
          result?: Json
          score?: number | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          activity_type: string
          start_date: string
          end_date: string | null
          organization: string | null
          role: string | null
          achievements: string[] | null
          skills: string[] | null
          related_subjects: string[] | null
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          activity_type: string
          start_date: string
          end_date?: string | null
          organization?: string | null
          role?: string | null
          achievements?: string[] | null
          skills?: string[] | null
          related_subjects?: string[] | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          activity_type?: string
          start_date?: string
          end_date?: string | null
          organization?: string | null
          role?: string | null
          achievements?: string[] | null
          skills?: string[] | null
          related_subjects?: string[] | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      mentor_sessions: {
        Row: {
          id: string
          user_id: string
          question: string
          answer: string
          context: Json | null
          helpful: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          answer: string
          context?: Json | null
          helpful?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          answer?: string
          context?: Json | null
          helpful?: boolean | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
