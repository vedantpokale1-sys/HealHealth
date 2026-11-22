import React, { createContext, useContext, useState } from 'react';
import { Appointment, MedicalReport, Medication, FamilyMember, NotificationItem, Doctor, ExtendedChatMessage } from '../types';
import { MOCK_APPOINTMENTS, MOCK_REPORTS, MOCK_MEDICATIONS, MOCK_FAMILY_MEMBERS, MOCK_NOTIFICATIONS, MOCK_DOCTORS } from '../data/mockData';

const DEFAULT_AI_CHAT_MESSAGE: ExtendedChatMessage = {
  id: 'msg_init',
  sender: 'ai',
  text: "Hello! I am your HEALHEALTH AI Healthcare Navigator. Describe any physical symptoms, medications, or lab report questions. I will guide you with evidence-grounded clinical information, suggest follow-up questions, and connect you with verified medical specialists.",
  timestamp: 'Just now',
  modelUsed: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
};

interface AppContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  reports: MedicalReport[];
  medications: Medication[];
  familyMembers: FamilyMember[];
  notifications: NotificationItem[];
  aiChatMessages: ExtendedChatMessage[];
  setAiChatMessages: React.Dispatch<React.SetStateAction<ExtendedChatMessage[]>>;
  clearAiChat: (initialText?: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => string;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  addReport: (report: Omit<MedicalReport, 'id'>) => MedicalReport;
  toggleMedicationDose: (medId: string, slotIdx: number) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [reports, setReports] = useState<MedicalReport[]>(MOCK_REPORTS);
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Persistent AI Chat History across tabs, navigation, and page reloads
  const [aiChatMessages, setAiChatMessages] = useState<ExtendedChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('healhealth_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved AI chat history:', e);
    }
    return [DEFAULT_AI_CHAT_MESSAGE];
  });

  // Automatically save chat history whenever it changes
  React.useEffect(() => {
    try {
      if (aiChatMessages && aiChatMessages.length > 0) {
        localStorage.setItem('healhealth_ai_chat_history', JSON.stringify(aiChatMessages));
      }
    } catch (e) {
      console.warn('Could not persist AI chat history:', e);
    }
  }, [aiChatMessages]);

  const clearAiChat = (initialText?: string) => {
    const freshMessage: ExtendedChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'ai',
      text:
        initialText ||
        "Conversation reset. Feel free to describe any new symptoms, health questions, or lab results.",
      timestamp: 'Just now',
      modelUsed: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    };
    setAiChatMessages([freshMessage]);
    try {
      localStorage.setItem('healhealth_ai_chat_history', JSON.stringify([freshMessage]));
    } catch {
      // Ignore
    }
  };

  // Sync doctors and appointments from Backend API
  React.useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getDoctors()
        .then((dbDoctors) => {
          if (dbDoctors && dbDoctors.length > 0) {
            setDoctors(dbDoctors);
          }
        })
        .catch((err) => console.warn('Could not sync doctors from backend API, using cached:', err));

      api.getAppointments('usr_001')
        .then((dbAppointments) => {
          if (dbAppointments && dbAppointments.length > 0) {
            setAppointments(dbAppointments);
          }
        })
        .catch((err) => console.warn('Could not sync appointments from backend API, using cached:', err));
    });
  }, []);

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const id = `apt_${Date.now()}`;
    const newApt: Appointment = { ...appointment, id };
    setAppointments(prev => [newApt, ...prev]);

    // Persist to backend database asynchronously
    import('../services/api').then(({ api }) => {
      api.bookAppointment({
        userId: 'usr_001',
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        symptoms: appointment.symptoms,
      }).catch((e) => console.warn('Backend booking sync notice:', e.message));
    });

    // Also add a notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Appointment Confirmed',
        message: `Consultation with ${newApt.doctorName} booked for ${newApt.date} at ${newApt.time}.`,
        time: 'Just now',
        type: 'appointment',
        isRead: false,
        actionUrl: '/appointments',
      },
      ...prev,
    ]);
    return id;
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );

    // Persist to backend database
    import('../services/api').then(({ api }) => {
      api.cancelAppointment(id, 'usr_001').catch((e) =>
        console.warn('Backend cancellation sync notice:', e.message)
      );
    });
  };

  const rescheduleAppointment = (id: string, date: string, time: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, date, time } : apt))
    );
  };

  const addReport = (report: Omit<MedicalReport, 'id'>): MedicalReport => {
    const newReport: MedicalReport = { ...report, id: `rep_${Date.now()}` };
    setReports(prev => [newReport, ...prev]);
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'New Medical Report Analyzed',
        message: `Report "${newReport.title}" was analyzed by AI Assistant.`,
        time: 'Just now',
        type: 'report',
        isRead: false,
        actionUrl: '/reports/analyzer',
      },
      ...prev,
    ]);
    return newReport;
  };

  const toggleMedicationDose = (medId: string, slotIdx: number) => {
    setMedications(prev =>
      prev.map(med => {
        if (med.id !== medId) return med;
        const slots = [...med.timeSlots];
        const current = slots[slotIdx];
        slots[slotIdx] = {
          ...current,
          taken: !current.taken,
          takenAt: !current.taken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
        return { ...med, timeSlots: slots };
      })
    );
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500'];
    const newFam: FamilyMember = {
      ...member,
      id: `fam_${Date.now()}`,
      avatarColor: member.avatarColor || colors[Math.floor(Math.random() * colors.length)],
    };
    setFamilyMembers(prev => [...prev, newFam]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        doctors,
        appointments,
        reports,
        medications,
        familyMembers,
        notifications,
        aiChatMessages,
        setAiChatMessages,
        clearAiChat,
        addAppointment,
        cancelAppointment,
        rescheduleAppointment,
        addReport,
        toggleMedicationDose,
        addFamilyMember,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
