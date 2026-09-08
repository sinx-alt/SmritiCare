import { createContext, useContext, useState } from 'react';

type ReminderCategory =
  | 'Meal'
  | 'Hydration'
  | 'Exercise'
  | 'Family';

type Reminder = {
  id: string;
  title: string;
  time: string;
  category: ReminderCategory;
  completed: boolean;
};

type ReminderContextType = {
  reminders: Reminder[];
  addReminder: (
    title: string,
    time: string,
    category: ReminderCategory
  ) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
};

const ReminderContext =
  createContext<ReminderContextType | null>(null);

export function ReminderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  function addReminder(
    title: string,
    time: string,
    category: ReminderCategory
  ) {
    setReminders(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        time,
        category,
        completed: false,
      },
    ]);
  }

  function toggleReminder(id: string) {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? {
              ...reminder,
              completed: !reminder.completed,
            }
          : reminder
      )
    );
  }

  function deleteReminder(id: string) {
    setReminders(prev =>
      prev.filter(reminder => reminder.id !== id)
    );
  }

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);

  if (!context) {
    throw new Error(
      'useReminders must be used inside ReminderProvider'
    );
  }

  return context;
}