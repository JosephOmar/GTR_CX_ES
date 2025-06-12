export interface Schedule {
  date: string;
  day: string;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_rest_day: boolean;
}

export interface UbycallSchedule {
  date: string;
  day: string;
  start_time: string;
  end_time: string;
}

export interface Worker {
  document: string;
  name: string;
  role: { name: string };
  status: { name: string };
  campaign: { name: string };
  team: { name: string };
  work_type: { name: string };
  contract_type: { name: string };
  manager: string;
  supervisor: string;
  coordinator: string;
  start_date: string;
  termination_date: string | null;
  requirement_id: string;
  kustomer_id: string;
  kustomer_name: string;
  kustomer_email: string;
  observation_1: string;
  observation_2: string;
  tenure: number;
  trainee: string | null;
  schedules: Schedule[];
  ubycall_schedules: UbycallSchedule[];
}
