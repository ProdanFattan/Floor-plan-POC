import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './app.module';
import { Patient } from './patients/schemas/patient.schema';
import { Schedule } from './schedules/schemas/schedule.schema';
import { Staff } from './staff/schemas/staff.schema';
import { FloorPlan } from './floor-plan/schemas/floor-plan.schema';
import { FloorPlanLive } from './floor-plan-live/schemas/floor-plan-live.schema';

const PATIENTS: Omit<Patient, 'createdAt' | 'updatedAt'>[] = [
  { firstName: 'Jane', lastName: 'Smith', phn: '9123456781', dob: '1984-03-12', gender: 'female', phone: '604-555-0101' },
  { firstName: 'Omar', lastName: 'Haddad', phn: '9123456782', dob: '1971-08-30', gender: 'male', phone: '604-555-0102' },
  { firstName: 'Mei', lastName: 'Tanaka', phn: '9123456783', dob: '1995-12-02', gender: 'female', phone: '604-555-0103' },
  { firstName: 'Lucas', lastName: 'Silva', phn: '9123456784', dob: '1962-05-19', gender: 'male', phone: '604-555-0104' },
  { firstName: 'Aisha', lastName: 'Bello', phn: '9123456785', dob: '2001-01-25', gender: 'female', phone: '604-555-0105' },
  { firstName: 'Ethan', lastName: 'Murphy', phn: '9123456786', dob: '1958-10-07', gender: 'male', phone: '604-555-0106' },
  { firstName: 'Zara', lastName: 'Ahmed', phn: '9123456787', dob: '1989-06-14', gender: 'female', phone: '604-555-0107' },
  { firstName: 'Mateo', lastName: 'Garcia', phn: '9123456788', dob: '2015-09-03', gender: 'male', phone: '604-555-0108' },
];

const VISITS: { at: string; minutes: number; type: string; reason: string; status: string }[] = [
  { at: '08:30', minutes: 30, type: 'Consultation', reason: 'Persistent cough', status: 'checked-in' },
  { at: '09:00', minutes: 20, type: 'Follow-up', reason: 'Blood pressure review', status: 'waiting' },
  { at: '09:30', minutes: 30, type: 'Lab work', reason: 'Fasting bloods', status: 'scheduled' },
  { at: '10:00', minutes: 45, type: 'Procedure', reason: 'Wound dressing', status: 'scheduled' },
  { at: '10:45', minutes: 30, type: 'Walk-in', reason: 'Sprained ankle', status: 'scheduled' },
  { at: '11:30', minutes: 60, type: 'Admission', reason: 'Observation overnight', status: 'scheduled' },
  { at: '13:00', minutes: 30, type: 'Consultation', reason: 'Migraine', status: 'scheduled' },
  { at: '14:00', minutes: 20, type: 'Follow-up', reason: 'Vaccination', status: 'scheduled' },
];

function atToday(time: string, dayOffset = 0): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

async function run() {
  const reset = process.argv.includes('--reset');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  await app.init();

  const patients = app.get<Model<Patient>>(getModelToken(Patient.name));
  const schedules = app.get<Model<Schedule>>(getModelToken(Schedule.name));
  const staff = app.get<Model<Staff>>(getModelToken(Staff.name));
  const live = app.get<Model<FloorPlanLive>>(getModelToken(FloorPlanLive.name));
  const plans = app.get<Model<FloorPlan>>(getModelToken(FloorPlan.name));

  await Promise.all([patients.deleteMany({}), schedules.deleteMany({}), live.deleteMany({})]);
  if (reset) await plans.deleteMany({});

  const doctors = await staff.find({ role: 'doctor' }).lean();
  const createdPatients = await patients.insertMany(PATIENTS);

  const rows = createdPatients.flatMap((patient, index) => {
    const visit = VISITS[index % VISITS.length];
    const doctor = doctors[index % Math.max(doctors.length, 1)];
    const base = {
      patientId: patient._id as Types.ObjectId,
      medicalStaffId: (doctor?._id as Types.ObjectId | undefined) ?? null,
      typeOfVisit: visit.type,
      visitReason: visit.reason,
      notes: '',
    };
    const today = atToday(visit.at);
    const tomorrow = atToday(visit.at, 1);
    const list = [
      { ...base, start: today, end: new Date(today.getTime() + visit.minutes * 60000), statusId: visit.status },
    ];
    if (index < 3) {
      list.push({
        ...base,
        start: tomorrow,
        end: new Date(tomorrow.getTime() + visit.minutes * 60000),
        statusId: 'scheduled',
      });
    }
    return list;
  });
  await schedules.insertMany(rows);

  console.log(
    `Seeded ${createdPatients.length} patients and ${rows.length} schedules` +
      (reset ? ' (floor plan cleared — the client loads the Small Clinic template on next open)' : ''),
  );
  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
