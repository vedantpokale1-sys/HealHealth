import { Router } from 'express';
import { z } from 'zod';
import { appointmentDao, doctorDao } from '../db/db';

export const appointmentRouter = Router();

// GET /api/v1/appointments - List appointments for user
appointmentRouter.get('/', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_001';
  const appointments = appointmentDao.getByUserId(userId);
  res.json({ appointments });
});

// GET /api/v1/appointments/slots - Get available & booked slots for a doctor on a specific date
appointmentRouter.get('/slots', (req, res) => {
  const doctorId = req.query.doctorId as string;
  const date = req.query.date as string;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date query parameters are required' });
  }

  const doctor = doctorDao.getById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const allSlots: string[] = doctor.availableSlots || [
    '09:30 AM',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '04:30 PM',
    '06:00 PM',
  ];
  const bookedSlots = appointmentDao.getBookedSlots(doctorId, date);
  const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

  res.json({
    doctorId,
    date,
    allSlots,
    bookedSlots,
    availableSlots,
  });
});

const createAppointmentSchema = z.object({
  userId: z.string().optional().default('usr_001'),
  doctorId: z.string().min(1, 'doctorId is required'),
  date: z.string().min(1, 'date is required'),
  time: z.string().min(1, 'time is required'),
  type: z.enum(['video', 'in-person']).default('video'),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/v1/appointments - Book a new appointment
appointmentRouter.post('/', (req, res, next) => {
  try {
    const parse = createAppointmentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { userId, doctorId, date, time, type, symptoms, notes } = parse.data;

    const doctor = doctorDao.getById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const appointmentId = `apt_${Date.now()}`;
    const newAppointment = appointmentDao.create({
      id: appointmentId,
      userId,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatarUrl,
      clinicName: doctor.clinic,
      date,
      time,
      type,
      status: 'upcoming',
      symptoms,
      notes,
      joinUrl: `https://healhealth.care/teleconsult/${appointmentId}`,
    });

    res.status(201).json({
      message: 'Appointment confirmed successfully',
      appointment: newAppointment,
    });
  } catch (err: any) {
    if (err.message?.includes('already booked')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /api/v1/appointments/:id - Cancel an appointment
appointmentRouter.delete('/:id', (req, res, next) => {
  try {
    const userId = (req.query.userId as string) || 'usr_001';
    const cancelled = appointmentDao.cancel(req.params.id, userId);
    res.json({
      message: 'Appointment cancelled successfully',
      appointment: cancelled,
    });
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message?.includes('Unauthorized')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});
