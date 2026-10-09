import { Router } from 'express';
import { doctorDao } from '../db/db';

export const doctorRouter = Router();

// GET /api/v1/doctors - List or search doctors
doctorRouter.get('/', (req, res) => {
  const query = req.query.query as string | undefined;
  const specialty = req.query.specialty as string | undefined;
  const location = req.query.location as string | undefined;

  if (query || specialty || location) {
    const doctors = doctorDao.search({ query, specialty, location });
    return res.json({ doctors, total: doctors.length });
  }

  const doctors = doctorDao.getAll();
  res.json({ doctors, total: doctors.length });
});

// GET /api/v1/doctors/:id - Single doctor details
doctorRouter.get('/:id', (req, res) => {
  const doctor = doctorDao.getById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  res.json({ doctor });
});
