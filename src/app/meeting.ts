export interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  creator: string;
  assignedTo: string;
}
