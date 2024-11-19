// types/google/responses.ts
import { GooglePlace } from "./place";

export interface GoogleSearchResponse {
    places: GooglePlace[];
    nextPageToken?: string;
  }
  
  export interface GoogleErrorDetail {
    type: string;
    reason?: string;
    domain?: string;
    metadata?: Record<string, string>;
  }
  
  export interface GoogleError {
    code: number;
    message: string;
    status: string;
    details?: GoogleErrorDetail[];
  }