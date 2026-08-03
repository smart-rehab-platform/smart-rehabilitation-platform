/** Mock data for Parent Dashboard visual preview — no API wiring */

/** Per-child dashboard payloads — switching child refreshes dependent sections */
export const childDashboardById = {
  "child-omar": {
    summary: {
      todaysExercises: 4,
      remaining: 2,
      completed: 2,
      completionPercent: 50,
      nextSessionLabel: "Tomorrow",
      nextSessionTime: "10:30 AM",
      nextSessionDetail: "10:30 AM · Dr. Lina",
      overallProgress: "72%",
      overallProgressPercent: 72,
      overallProgressDetail: "+8% this month",
      newFeedback: 1,
      newFeedbackDetail: "From Dr. Lina Ahmad",
    },
    exercises: [
      {
        id: "ex-1",
        title: "Pronunciation Practice — R Sounds",
        category: "Speech Therapy",
        duration: "10 min",
        due: "Due Today",
        status: "todo",
      },
      {
        id: "ex-2",
        title: "Picture Naming Activity",
        category: "Language Skills",
        duration: "8 min",
        due: "Due Today",
        status: "submitted",
      },
      {
        id: "ex-3",
        title: "Breathing and Voice Exercise",
        category: "Speech Therapy",
        duration: "5 min",
        due: "Due Today",
        status: "reviewed",
      },
      {
        id: "ex-4",
        title: "Story Retelling Practice",
        category: "Communication",
        duration: null,
        due: "Due: Yesterday",
        status: "needs_retry",
      },
    ],
    upcomingExercises: [
      {
        id: "up-1",
        title: "Story Retelling Practice",
        whenLabel: "Tomorrow",
        duration: "15 min",
        category: "Communication",
      },
      {
        id: "up-2",
        title: "Breathing Practice",
        whenLabel: "July 20",
        duration: "5 min",
        category: "Speech Therapy",
      },
      {
        id: "up-3",
        title: "Picture Matching Activity",
        whenLabel: "July 22",
        duration: "10 min",
        category: "Language Skills",
      },
    ],
    progressOverview: {
      overallPercent: 72,
      trendLabel: "Steady improvement",
      trendDelta: "+8% this month",
      description:
        "Omar is making consistent progress toward his current therapy goals.",
      bars: [
        { id: "speech", label: "Speech Practice", percent: 78, tone: "blue" },
        {
          id: "consistency",
          label: "Exercise Consistency",
          percent: 82,
          tone: "teal",
        },
        { id: "goals", label: "Goal Completion", percent: 65, tone: "purple" },
      ],
    },
    weeklyProgress: {
      streakDays: 5,
      completedCount: 12,
      totalCount: 15,
      rangeLabel: "This Week",
      days: [
        { id: "mon", label: "Mon", percent: 70, kind: "past" },
        { id: "tue", label: "Tue", percent: 85, kind: "past" },
        { id: "wed", label: "Wed", percent: 55, kind: "past" },
        { id: "thu", label: "Thu", percent: 90, kind: "past" },
        { id: "fri", label: "Fri", percent: 78, kind: "past" },
        { id: "sat", label: "Sat", percent: 45, kind: "today" },
        { id: "sun", label: "Sun", percent: 0, kind: "upcoming" },
      ],
    },
    calendar: {
      monthLabel: "July 2026",
      year: 2026,
      monthIndex: 6,
      todayDay: 18,
      selectedDay: 18,
      sessionDays: [15, 20, 22, 28],
      exerciseDays: [15, 18, 20, 22, 28],
    },
    exercisesByDay: {
      15: [
        { id: "d15-1", title: "Warm-up Articulation", duration: "6 min", status: "reviewed" },
        { id: "d15-2", title: "Listening Practice", duration: "10 min", status: "submitted" },
      ],
      18: [
        { id: "ex-1", title: "Pronunciation Practice", duration: "10 min", status: "todo" },
        { id: "ex-2", title: "Picture Naming Activity", duration: "8 min", status: "submitted" },
        { id: "ex-3", title: "Breathing Exercise", duration: "5 min", status: "reviewed" },
      ],
      20: [
        { id: "d20-1", title: "Sentence Building", duration: "12 min", status: "todo" },
        { id: "d20-2", title: "Voice Control Drill", duration: "7 min", status: "todo" },
      ],
      22: [
        { id: "d22-1", title: "Story Sequencing", duration: "15 min", status: "todo" },
      ],
      28: [
        { id: "d28-1", title: "Weekly Review Set", duration: "20 min", status: "todo" },
        { id: "d28-2", title: "Parent-Guided Practice", duration: "10 min", status: "todo" },
        { id: "d28-3", title: "Cool-down Breathing", duration: "5 min", status: "todo" },
      ],
    },
    sessionsByDay: {
      15: [{ specialistName: "Dr. Lina Ahmad", time: "2:00 PM", mode: "Online" }],
      20: [{ specialistName: "Dr. Lina Ahmad", time: "10:30 AM", mode: "Online" }],
      22: [{ specialistName: "Dr. Lina Ahmad", time: "11:00 AM", mode: "In-person" }],
      28: [{ specialistName: "Dr. Lina Ahmad", time: "10:30 AM", mode: "Online" }],
    },
    upcomingSession: {
      childName: "Omar Hassan",
      specialistName: "Dr. Lina Ahmad",
      specialty: "Speech Therapy",
      dateLabel: "Tomorrow",
      timeLabel: "10:30 AM",
      whenLabel: "Tomorrow · 10:30 AM",
      mode: "Online",
      durationMinutes: 45,
      status: "Scheduled",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
    },
    latestReport: {
      title: "Weekly Progress Report",
      date: "July 17, 2026",
      preview: "Steady improvement across therapy areas this week.",
    },
    recentFeedback: {
      specialistName: "Dr. Lina Ahmad",
      specialty: "Speech Therapy",
      date: "July 17, 2026",
      quote:
        "Great improvement in pronunciation. Please repeat the breathing exercise twice this week.",
    },
  },
  "child-layla": {
    summary: {
      todaysExercises: 0,
      remaining: 0,
      completed: 0,
      completionPercent: 0,
      nextSessionLabel: "—",
      nextSessionTime: null,
      nextSessionDetail: "No session scheduled",
      overallProgress: "—",
      overallProgressPercent: 0,
      overallProgressDetail: "Case intake in progress",
      newFeedback: 0,
      newFeedbackDetail: null,
    },
    exercises: [],
    upcomingExercises: [],
    progressOverview: {
      overallPercent: 0,
      trendLabel: "Getting started",
      trendDelta: null,
      description: "Progress tracking begins once the treatment plan is active.",
      bars: [],
    },
    weeklyProgress: {
      streakDays: 0,
      completedCount: 0,
      totalCount: 0,
      rangeLabel: "This Week",
      days: [],
    },
    calendar: {
      monthLabel: "July 2026",
      year: 2026,
      monthIndex: 6,
      todayDay: 18,
      selectedDay: 18,
      sessionDays: [],
      exerciseDays: [],
    },
    exercisesByDay: {},
    sessionsByDay: {},
    upcomingSession: null,
    latestReport: null,
    recentFeedback: null,
  },
};

export function getChildDashboard(childId) {
  return childDashboardById[childId] || childDashboardById["child-omar"];
}

export function buildEncouragementMessage({ childFirstName, summary, weeklyProgress }) {
  if (summary.completed > 0) {
    const count = summary.completed;
    const noun = count === 1 ? "activity" : "activities";
    return `${count} ${noun} completed today — nice work supporting ${childFirstName}!`;
  }
  if (weeklyProgress.completedCount > 0) {
    return `Great job! ${childFirstName} completed ${weeklyProgress.completedCount} exercises this week.`;
  }
  if (summary.overallProgressPercent > 0) {
    return `${childFirstName} is making steady progress. Keep going!`;
  }
  return "Every small step builds meaningful progress.";
}

export const parentDashboardMock = {
  parent: {
    id: "parent-1",
    fullName: "Sara Hassan",
    role: "Parent",
    initials: "S",
  },
  children: [
    {
      id: "child-omar",
      fullName: "Omar Hassan",
      status: "Active treatment plan",
      initials: "O",
    },
    {
      id: "child-layla",
      fullName: "Layla Hassan",
      status: "Case intake in progress",
      initials: "L",
    },
  ],
  selectedChildId: "child-omar",
  specialist: {
    fullName: "Dr. Lina Ahmad",
    specialty: "Speech Therapy",
    initials: "L",
  },
  badges: {
    messages: 3,
    notifications: 5,
  },
  summary: {
    todaysExercises: 4,
    remaining: 2,
    completed: 2,
    completionPercent: 50,
    nextSessionLabel: "Tomorrow",
    nextSessionDetail: "10:30 AM · Dr. Lina",
    overallProgress: "72%",
    overallProgressDetail: "+8% this month",
    newFeedback: 1,
    newFeedbackDetail: "From Dr. Lina Ahmad",
  },
  upcomingExercises: [
    {
      id: "up-1",
      title: "Story Retelling Practice",
      whenLabel: "Tomorrow",
      duration: "15 min",
      category: "Communication",
    },
    {
      id: "up-2",
      title: "Breathing Practice",
      whenLabel: "July 20",
      duration: "5 min",
      category: "Speech Therapy",
    },
    {
      id: "up-3",
      title: "Picture Matching Activity",
      whenLabel: "July 22",
      duration: "10 min",
      category: "Language Skills",
    },
  ],
  progressOverview: {
    overallPercent: 72,
    trendLabel: "Steady improvement",
    trendDelta: "+8% this month",
    description:
      "Omar is making consistent progress toward his current therapy goals.",
    bars: [
      { id: "speech", label: "Speech Practice", percent: 78, tone: "blue" },
      {
        id: "consistency",
        label: "Exercise Consistency",
        percent: 82,
        tone: "teal",
      },
      // Retained for future progress page; not shown on compact dashboard
      { id: "goals", label: "Goal Completion", percent: 65, tone: "purple" },
    ],
  },
  exercises: [
    {
      id: "ex-1",
      title: "Pronunciation Practice — R Sounds",
      category: "Speech Therapy",
      duration: "10 min",
      due: "Due Today",
      status: "todo",
    },
    {
      id: "ex-2",
      title: "Picture Naming Activity",
      category: "Language Skills",
      duration: "8 min",
      due: "Due Today",
      status: "submitted",
    },
    {
      id: "ex-3",
      title: "Breathing and Voice Exercise",
      category: "Speech Therapy",
      duration: "5 min",
      due: "Due Today",
      status: "reviewed",
    },
    {
      id: "ex-4",
      title: "Story Retelling Practice",
      category: "Communication",
      duration: null,
      due: "Due: Yesterday",
      status: "needs_retry",
    },
  ],
  /** Dashboard tabs: Completed groups Submitted + Reviewed */
  dashboardExerciseFilters: [
    { id: "all", label: "All" },
    { id: "todo", label: "To Do" },
    { id: "completed", label: "Completed" },
  ],
  /** Full five-status filters retained for dedicated Exercises page concept */
  exerciseFilters: [
    { id: "all", label: "All" },
    { id: "todo", label: "To Do" },
    { id: "submitted", label: "Submitted" },
    { id: "reviewed", label: "Reviewed" },
    { id: "needs_retry", label: "Needs Retry" },
  ],
  weeklyProgress: {
    streakDays: 5,
    completedCount: 12,
    totalCount: 15,
    rangeLabel: "This Week",
    days: [
      { id: "mon", label: "Mon", percent: 70, kind: "past" },
      { id: "tue", label: "Tue", percent: 85, kind: "past" },
      { id: "wed", label: "Wed", percent: 55, kind: "past" },
      { id: "thu", label: "Thu", percent: 90, kind: "past" },
      { id: "fri", label: "Fri", percent: 78, kind: "past" },
      { id: "sat", label: "Sat", percent: 45, kind: "today" },
      { id: "sun", label: "Sun", percent: 0, kind: "upcoming" },
    ],
  },
  goals: [
    {
      id: "g1",
      title: "Improve pronunciation clarity",
      type: "Short-term goal",
      percent: 75,
    },
    {
      id: "g2",
      title: "Use complete sentences",
      type: "Long-term goal",
      percent: 60,
    },
    {
      id: "g3",
      title: "Follow two-step instructions",
      type: "Short-term goal",
      percent: 45,
    },
  ],
  quickActions: [
    { id: "request-session", label: "Request Session", tone: "blue" },
    { id: "message", label: "Message Specialist", tone: "navy" },
    { id: "case", label: "New Case Request", tone: "green" },
    { id: "ai", label: "Ask AI Assistant", tone: "orange" },
  ],
  activeCaseRequest: {
    childName: "Layla Hassan",
    childFirstName: "Layla",
    anotherChildLabel: "Another Child",
    therapyType: "Behavioral Therapy",
    specialistName: "Dr. Ahmad Saleh",
    updatedLabel: "Updated 2 hours ago",
    status: "Under Assessment",
    caseNumber: "#CR-2026-042",
    title: "Case Request for Layla Hassan",
    steps: [
      { id: "pending", label: "Pending", done: true },
      { id: "assigned", label: "Assigned", done: true },
      { id: "assessment", label: "Assessment", done: true },
      { id: "accepted", label: "Accepted", done: false },
    ],
  },
  notifications: [
    {
      id: "n1",
      title: "New feedback received for Picture Naming Activity",
      timeAgo: "1h ago",
      unread: true,
      tone: "blue",
      icon: "message",
    },
    {
      id: "n2",
      title: "Your session request has been approved",
      timeAgo: "3h ago",
      unread: true,
      tone: "green",
      icon: "calendar",
    },
    {
      id: "n3",
      title: "A new weekly report is ready for Omar",
      timeAgo: "Yesterday",
      unread: false,
      tone: "gray",
      icon: "report",
    },
  ],
  recentUpdates: [
    {
      id: "u1",
      title: "New feedback received for Picture Naming Activity",
      meta: "Dr. Lina Ahmad · 1h ago",
      unread: true,
      icon: "feedback",
      actionLabel: "View Feedback",
    },
    {
      id: "u2",
      title: "Your session request has been approved",
      meta: "3h ago",
      unread: true,
      icon: "calendar",
      actionLabel: "View Session",
    },
    {
      id: "u3",
      title: "A new weekly report is ready for Omar",
      meta: "Yesterday",
      unread: false,
      icon: "report",
      actionLabel: "Open Report",
    },
  ],
  calendar: {
    monthLabel: "July 2026",
    year: 2026,
    monthIndex: 6,
    todayDay: 18,
    selectedDay: 18,
    sessionDays: [15, 20, 22, 28],
    exerciseDays: [15, 18, 20, 22, 28],
  },
  /** Exercises keyed by day-of-month for selected-day rail */
  exercisesByDay: {
    15: [
      {
        id: "d15-1",
        title: "Warm-up Articulation",
        duration: "6 min",
        status: "reviewed",
      },
      {
        id: "d15-2",
        title: "Listening Practice",
        duration: "10 min",
        status: "submitted",
      },
    ],
    18: [
      {
        id: "ex-1",
        title: "Pronunciation Practice",
        duration: "10 min",
        status: "todo",
      },
      {
        id: "ex-2",
        title: "Picture Naming Activity",
        duration: "8 min",
        status: "submitted",
      },
      {
        id: "ex-3",
        title: "Breathing Exercise",
        duration: "5 min",
        status: "reviewed",
      },
    ],
    20: [
      {
        id: "d20-1",
        title: "Sentence Building",
        duration: "12 min",
        status: "todo",
      },
      {
        id: "d20-2",
        title: "Voice Control Drill",
        duration: "7 min",
        status: "todo",
      },
    ],
    22: [
      {
        id: "d22-1",
        title: "Story Sequencing",
        duration: "15 min",
        status: "todo",
      },
    ],
    28: [
      {
        id: "d28-1",
        title: "Weekly Review Set",
        duration: "20 min",
        status: "todo",
      },
      {
        id: "d28-2",
        title: "Parent-Guided Practice",
        duration: "10 min",
        status: "todo",
      },
      {
        id: "d28-3",
        title: "Cool-down Breathing",
        duration: "5 min",
        status: "todo",
      },
    ],
  },
  upcomingSession: {
    childName: "Omar Hassan",
    specialistName: "Dr. Lina Ahmad",
    specialty: "Speech Therapy",
    whenLabel: "Tomorrow · 10:30 AM",
    mode: "Online",
    durationMinutes: 45,
    status: "Scheduled",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  },
  latestReport: {
    title: "Weekly Progress Report",
    date: "July 17, 2026",
    preview:
      "Omar showed steady improvement this week across all therapy areas.",
  },
  recentFeedback: {
    specialistName: "Dr. Lina Ahmad",
    specialty: "Speech Therapy",
    date: "July 17, 2026",
    quote:
      "Great improvement in pronunciation. Please repeat the breathing exercise twice this week. Omar is responding well to the structured practice sessions.",
  },
  navItems: [
    { id: "dashboard", label: "Dashboard", icon: "layoutDashboard" },
    { id: "children", label: "My Children", icon: "users" },
    { id: "cases", label: "Case Requests", icon: "clipboardList" },
    { id: "exercises", label: "Exercises", icon: "activity" },
    { id: "progress", label: "Progress", icon: "trendingUp" },
    { id: "sessions", label: "Sessions", icon: "calendar" },
    { id: "reports", label: "Reports", icon: "fileText" },
    { id: "feedback", label: "Feedback", icon: "messageCircle" },
    { id: "messages", label: "Messages", icon: "messageSquare", badgeKey: "messages" },
    { id: "ai", label: "AI Assistant", icon: "sparkles" },
    { id: "notifications", label: "Notifications", icon: "bell", badgeKey: "notifications" },
    { id: "profile", label: "Profile", icon: "user" },
  ],
  aiSupport: {
    title: "Need quick guidance?",
    body: "Ask the AI Assistant about today’s exercises, session prep, or progress tips.",
    cta: "Open AI Assistant",
  },
};

export const exerciseStatusMeta = {
  todo: { label: "To Do", tone: "gray" },
  submitted: { label: "Submitted", tone: "success" },
  reviewed: { label: "Reviewed", tone: "purple" },
  needs_retry: { label: "Needs Retry", tone: "danger" },
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
