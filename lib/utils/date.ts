// lib/utils/date.ts
/**
 * Formate une date en format français
 * @param date Date à formater (string | Date)
 * @param options Options de formatage
 * @returns String formatée
 */
export function formatDate(
    date: string | Date,
    options: {
      includeTime?: boolean;
      includeSeconds?: boolean;
      includeYear?: boolean;
      shortMonth?: boolean;
    } = {}
  ): string {
    const {
      includeTime = false,
      includeSeconds = false,
      includeYear = true,
      shortMonth = false,
    } = options;
  
    const dateObj = typeof date === 'string' ? new Date(date) : date;
  
    // Gestion des dates invalides
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
  
    // Configuration pour l'affichage en français
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: shortMonth ? 'short' : 'long',
      year: includeYear ? 'numeric' : undefined,
      hour: includeTime ? 'numeric' : undefined,
      minute: includeTime ? 'numeric' : undefined,
      second: includeTime && includeSeconds ? 'numeric' : undefined,
      hour12: false
    });
  
    const formattedDate = formatter.format(dateObj);
  
    // Nettoyage pour les mois courts (suppression du point)
    return shortMonth ? formattedDate.replace('.', '') : formattedDate;
  }
  
  /**
   * Formate une durée relative en français
   * @param date Date à comparer
   * @returns String de durée relative
   */
  export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // Moins d'une minute
    if (diffInSeconds < 60) {
      return 'à l\'instant';
    }
    
    // Moins d'une heure
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    // Moins d'un jour
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    // Moins d'une semaine
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    // Plus d'une semaine : format standard
    return formatDate(dateObj, { shortMonth: true });
  }
  
  /**
   * Compare deux dates et retourne true si la première est plus récente
   * @param date1 Première date
   * @param date2 Deuxième date
   * @returns boolean
   */
  export function isMoreRecent(date1: string | Date, date2: string | Date): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    return d1.getTime() > d2.getTime();
  }
  
  /**
   * Formate une plage horaire
   * @param open Heure d'ouverture (format "HHmm")
   * @param close Heure de fermeture (format "HHmm")
   * @returns String formatée
   */
  export function formatTimeRange(open: string, close: string): string {
    const formatTime = (time: string) => {
      if (time.length !== 4) return time;
      const hour = parseInt(time.slice(0, 2));
      const minute = time.slice(2);
      return `${hour}h${minute === '00' ? '' : minute}`;
    };
  
    return `${formatTime(open)} - ${formatTime(close)}`;
  }
  
  /**
   * Convertit un jour de la semaine en français
   * @param day Numéro du jour (0-6, 0 = Dimanche)
   * @param format Format de sortie
   * @returns String du jour en français
   */
  export function getDayName(
    day: number,
    format: 'long' | 'short' | 'min' = 'long'
  ): string {
    const days = {
      long: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      short: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      min: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
    };
  
    return days[format][day] || '';
  }