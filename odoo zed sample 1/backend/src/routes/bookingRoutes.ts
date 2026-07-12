import { Router } from 'express';
import { getBookings, createBooking, updateBookingStatus, cancelBooking } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

export default router;
