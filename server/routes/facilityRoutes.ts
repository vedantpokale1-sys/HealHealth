import { Router } from 'express';
import { facilityDao } from '../db/db';

export const facilityRouter = Router();

// GET /api/v1/facilities - List or search healthcare facilities
facilityRouter.get('/', (req, res) => {
  const query = req.query.query as string | undefined;
  const type = req.query.type as string | undefined;
  const isEmergency = req.query.emergency === 'true';

  if (query || type || isEmergency) {
    const facilities = facilityDao.search({ query, type, isEmergency24x7: isEmergency });
    return res.json({ facilities, total: facilities.length });
  }

  const facilities = facilityDao.getAll();
  res.json({ facilities, total: facilities.length });
});

// GET /api/v1/facilities/:id - Single facility details
facilityRouter.get('/:id', (req, res) => {
  const facility = facilityDao.getById(req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Healthcare facility not found' });
  }
  res.json({ facility });
});
