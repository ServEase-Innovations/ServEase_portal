export type DailyTaskStatus =
  | 'Pending'
  | 'Completed';

export interface DailyTaskEmployee {
  employeeId: string;
  fullName: string;
  emailAddress: string;
  username: string;
  assignedRole: string;
  assignedDepartment: string;
  teamId?: string | null;
}

export interface DailyTaskJiraLink {
  dailyTaskJiraLinkId: string;
  label?: string | null;
  url: string;
  createdAt: string;
  createdAtEpoch: string;
}

export interface DailyTaskAttachment {
  dailyTaskAttachmentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedAtEpoch: string;
}

export interface DailyTask {
  dailyTaskSubmissionId: string;
  employeeId: string;
  workDescription: string;
  status: DailyTaskStatus;

  newIdeas?: string | null;

  submissionDate: string;
  submissionDateEpoch: string;

  submittedAt: string;
  submittedAtEpoch: string;

  updatedAt: string;
  updatedAtEpoch: string;

  employee?: DailyTaskEmployee;

  jiraLinks: DailyTaskJiraLink[];
  attachments: DailyTaskAttachment[];
}

export interface DailyTaskJiraLinkInput {
  label?: string;
  url: string;
}

export interface DailyTaskPayload {
  workDescription: string;
  status: DailyTaskStatus;
  newIdeas?: string;
  jiraLinks: DailyTaskJiraLinkInput[];
}

export interface DailyTaskListQuery {
  date: string;
  status?: DailyTaskStatus;
  employeeId?: string;
}

export interface DailyTaskListResponse {
  date: string;
  count: number;
  dailyTasks: DailyTask[];
}

export interface DailyTaskMutationResponse {
  message: string;
  dailyTask: DailyTask;
}