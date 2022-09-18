import { z } from "zod";

export const JournalEntrySchema = z.object({
  id: z.string(),
  amount: z.number(),
  account: z.string(),
  description: z.string().optional(),
});

export const JournalSchema = z.object({
  id: z.string(),
  description: z.optional(
    z.string({ description: "Journal description or note" })
  ),
  timestamp: z.number({ description: "Date recorded" }),
  date: z.number({ description: "Date posted" }),
  entries: z.array(JournalEntrySchema),
});

const CreateJournalSchema = JournalSchema.omit({
  id: true,
  timestamp: true,
}).extend({
  entries: z.array(JournalEntrySchema.omit({ id: true })),
});

export const TransactionSchema = JournalEntrySchema.extend({
  date: z.number({ description: "Date posted" }),
  journal_description: z.string().optional(),
});

export type JournalCreate = z.infer<typeof CreateJournalSchema>;
export type JournalData = z.infer<typeof JournalSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

export class Journal {
  static flatten(journals: JournalData[]) {
    return journals.reduce((flattens, journal) => {
      let entries = journal.entries.map(
        (ent) =>
          ({
            ...ent,
            date: journal.date,
            journal_description: journal.description,
          } as Transaction)
      );
      return flattens.concat(entries);
    }, [] as Transaction[]);
  }
}
