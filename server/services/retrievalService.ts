import { medicalKnowledgeDao, doctorDao, facilityDao } from '../db/db';

export interface RetrievalResult {
  groundedKnowledge: Array<{
    topic: string;
    category: string;
    summary: string;
    clinicalGuidance: string;
    redFlags: string[];
    sourceTitle: string;
    sourceUrl: string;
  }>;
  matchedDoctors: any[];
  matchedFacilities: any[];
  suggestedSpecialty?: string;
}

export function retrieveMedicalContext(userQuery: string): RetrievalResult {
  const knowledgeMatches = medicalKnowledgeDao.search(userQuery);

  // Extract suggested specialties from top matched knowledge
  const specialtyCandidates: string[] = [];
  for (const km of knowledgeMatches.slice(0, 2)) {
    if (km.suggestedSpecialties && km.suggestedSpecialties.length > 0) {
      specialtyCandidates.push(...km.suggestedSpecialties);
    }
  }

  const primarySpecialty = specialtyCandidates[0] || 'General Physician';

  // Search doctors in database matching the specialty or query
  let matchedDoctors = doctorDao.search({ specialty: primarySpecialty });
  if (matchedDoctors.length === 0) {
    matchedDoctors = doctorDao.getAll().slice(0, 3);
  } else {
    matchedDoctors = matchedDoctors.slice(0, 3);
  }

  // Search facilities (prioritizing 24x7 ER if query has urgent indicators)
  const isUrgent =
    userQuery.toLowerCase().includes('emergency') ||
    userQuery.toLowerCase().includes('severe') ||
    userQuery.toLowerCase().includes('chest pain');

  const matchedFacilities = facilityDao
    .search({ isEmergency24x7: isUrgent ? true : undefined })
    .slice(0, 3);

  return {
    groundedKnowledge: knowledgeMatches.slice(0, 3).map(k => ({
      topic: k.topic,
      category: k.category,
      summary: k.summary,
      clinicalGuidance: k.clinicalGuidance,
      redFlags: k.redFlags,
      sourceTitle: k.sourceTitle,
      sourceUrl: k.sourceUrl,
    })),
    matchedDoctors,
    matchedFacilities,
    suggestedSpecialty: primarySpecialty,
  };
}
