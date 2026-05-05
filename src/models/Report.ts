import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  date: Date;
  name: string;
  todaysWork: string;
  meetingAttended?: string;
  bottleneck?: string;
  tomorrowPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: () => new Date(),
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    todaysWork: {
      type: String,
      required: [true, 'Today\'s work is required'],
      trim: true,
    },
    meetingAttended: {
      type: String,
      trim: true,
    },
    bottleneck: {
      type: String,
      trim: true,
    },
    tomorrowPlan: {
      type: String,
      required: [true, 'Tomorrow\'s plan is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast date-range queries
ReportSchema.index({ date: -1 });
ReportSchema.index({ name: 1 });

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
