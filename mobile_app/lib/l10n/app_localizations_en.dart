// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Smart Rehabilitation Platform';

  @override
  String get commonSave => 'Save';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonUpdate => 'Update';

  @override
  String get commonAdd => 'Add';

  @override
  String get commonCreate => 'Create';

  @override
  String get commonSubmit => 'Submit';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonContinue => 'Continue';

  @override
  String get commonBack => 'Back';

  @override
  String get commonNext => 'Next';

  @override
  String get commonPrevious => 'Previous';

  @override
  String get commonClose => 'Close';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonSearch => 'Search';

  @override
  String get commonFilter => 'Filter';

  @override
  String get commonRefresh => 'Refresh';

  @override
  String get commonAssign => 'Assign';

  @override
  String get commonRemove => 'Remove';

  @override
  String get commonView => 'View';

  @override
  String get commonSeeAll => 'See all';

  @override
  String get commonDetails => 'Details';

  @override
  String get commonDownload => 'Download';

  @override
  String get commonUpload => 'Upload';

  @override
  String get commonAttach => 'Attach';

  @override
  String get commonSend => 'Send';

  @override
  String get commonYes => 'Yes';

  @override
  String get commonNo => 'No';

  @override
  String get commonOk => 'OK';

  @override
  String get commonAll => 'All';

  @override
  String get commonNone => 'None';

  @override
  String get commonOptional => 'Optional';

  @override
  String get commonRequired => 'Required';

  @override
  String get commonMore => 'More';

  @override
  String get commonLoading => 'Loading';

  @override
  String get commonSaving => 'Saving…';

  @override
  String get commonSignIn => 'Sign In';

  @override
  String get commonSignOut => 'Sign Out';

  @override
  String get commonLogout => 'Logout';

  @override
  String get commonLanguage => 'Language';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String dashboardWelcomeBack(String userName) {
    return 'Welcome back, $userName';
  }

  @override
  String get dashboardNextSession => 'Next Session';

  @override
  String get dashboardLoading => 'Loading dashboard...';

  @override
  String get navHome => 'Home';

  @override
  String get navPatients => 'Patients';

  @override
  String get navExercises => 'Exercises';

  @override
  String get navReports => 'Reports';

  @override
  String get navNotifications => 'Notifications';

  @override
  String get navMessages => 'Messages';

  @override
  String get navProfile => 'Profile';

  @override
  String get navSettings => 'Settings';

  @override
  String get navUsers => 'Users';

  @override
  String get navSessions => 'Sessions';

  @override
  String get navCaseRequests => 'Case Requests';

  @override
  String get navPatientAssignments => 'Patient Assignments';

  @override
  String get navAuditLogs => 'Audit Logs';

  @override
  String get navAiCenter => 'AI Center';

  @override
  String get navTreatmentPlans => 'Treatment Plans';

  @override
  String get navPendingReviews => 'Pending Reviews';

  @override
  String get navTodaysSessions => 'Today\'s Sessions';

  @override
  String get navAssignedCaseRequests => 'Assigned Case Requests';

  @override
  String get navDailyTasks => 'Daily Tasks';

  @override
  String get navChildren => 'Children';

  @override
  String get navProgress => 'Progress';

  @override
  String get roleParent => 'Parent';

  @override
  String get roleSpecialist => 'Specialist';

  @override
  String get roleAdmin => 'Admin';

  @override
  String get roleUser => 'User';

  @override
  String get entityPatient => 'Patient';

  @override
  String get entityPatients => 'Patients';

  @override
  String get entityChild => 'Child';

  @override
  String get entityChildren => 'Children';

  @override
  String get entityExercise => 'Exercise';

  @override
  String get entityExercises => 'Exercises';

  @override
  String get entitySession => 'Session';

  @override
  String get entitySessions => 'Sessions';

  @override
  String get entityReport => 'Report';

  @override
  String get entityReports => 'Reports';

  @override
  String get entityNotification => 'Notification';

  @override
  String get entityNotifications => 'Notifications';

  @override
  String get entityMessage => 'Message';

  @override
  String get entityMessages => 'Messages';

  @override
  String get entityGoal => 'Goal';

  @override
  String get entityGoals => 'Goals';

  @override
  String get entityUser => 'User';

  @override
  String get entityUsers => 'Users';

  @override
  String get entityAttachment => 'Attachment';

  @override
  String get entityConversation => 'Conversation';

  @override
  String get entityTreatmentPlan => 'Treatment Plan';

  @override
  String get entityTreatmentPlans => 'Treatment Plans';

  @override
  String get entityCaseRequest => 'Case Request';

  @override
  String get entityCaseRequests => 'Case Requests';

  @override
  String get statusActive => 'Active';

  @override
  String get statusInactive => 'Inactive';

  @override
  String get statusPending => 'Pending';

  @override
  String get statusApproved => 'Approved';

  @override
  String get statusRejected => 'Rejected';

  @override
  String get statusCompleted => 'Completed';

  @override
  String get statusCancelled => 'Cancelled';

  @override
  String get statusScheduled => 'Scheduled';

  @override
  String get statusAccepted => 'Accepted';

  @override
  String get statusMissed => 'Missed';

  @override
  String get statusNoShow => 'No Show';

  @override
  String get statusNotCompleted => 'Not Completed';

  @override
  String get statusUnderAssessment => 'Under Assessment';

  @override
  String get statusPendingReview => 'Pending Review';

  @override
  String get statusSpecialistAssigned => 'Specialist Assigned';

  @override
  String get statusProfileCreated => 'Profile Created';

  @override
  String get messageNoData => 'No data';

  @override
  String get messageError => 'Error';

  @override
  String get messageSuccess => 'Success';

  @override
  String get messagePleaseTryAgain => 'Please try again.';

  @override
  String get messageSignInRequired => 'Please sign in to continue.';

  @override
  String get messageSomethingWentWrong => 'Something went wrong.';

  @override
  String get messageLoadingContent => 'Loading…';

  @override
  String get dateToday => 'Today';

  @override
  String get dateYesterday => 'Yesterday';

  @override
  String get dateTomorrow => 'Tomorrow';

  @override
  String get dateThisWeek => 'This Week';

  @override
  String get dateLastWeek => 'Last Week';

  @override
  String get filterAll => 'All';

  @override
  String get filterActive => 'Active';

  @override
  String get filterInactive => 'Inactive';

  @override
  String get filterCalendar => 'Calendar';

  @override
  String get filterList => 'List';

  @override
  String get clinicalAssessment => 'Assessment';

  @override
  String get clinicalSpeechAnalysis => 'Speech Analysis';

  @override
  String get clinicalAiAssistant => 'AI Assistant';

  @override
  String get clinicalTreatmentPlan => 'Treatment Plan';

  @override
  String get clinicalDiagnosis => 'Diagnosis';

  @override
  String get clinicalProgress => 'Progress';

  @override
  String get clinicalCurrentProgress => 'Current Progress';

  @override
  String get clinicalRecommendation => 'Recommendation';

  @override
  String get clinicalCategory => 'Category';

  @override
  String get clinicalTrendImproving => 'Improving';

  @override
  String get clinicalTrendStable => 'Stable';

  @override
  String get clinicalTrendNeedsAttention => 'Needs Attention';

  @override
  String get clinicalSessionOnline => 'Online';

  @override
  String get clinicalSessionInPerson => 'In Person';

  @override
  String get fieldEmail => 'Email';

  @override
  String get fieldPassword => 'Password';

  @override
  String get fieldPhone => 'Phone';

  @override
  String get fieldName => 'Name';

  @override
  String get fieldFullName => 'Full Name';

  @override
  String get fieldAddress => 'Address';

  @override
  String get fieldRole => 'Role';

  @override
  String get fieldGenderMale => 'Male';

  @override
  String get fieldGenderFemale => 'Female';

  @override
  String get authCommonCreateAccount => 'Create Account';

  @override
  String get authPasswordStrengthTitle => 'Password strength';

  @override
  String get authPasswordStrengthWeak => 'Weak';

  @override
  String get authPasswordStrengthMedium => 'Medium';

  @override
  String get authPasswordStrengthStrong => 'Strong';

  @override
  String get authPasswordRuleMinLength => 'At least 8 characters';

  @override
  String get authPasswordRuleUppercase => 'Contains uppercase letter';

  @override
  String get authPasswordRuleLowercase => 'Contains lowercase letter';

  @override
  String get authPasswordRuleNumber => 'Contains number';

  @override
  String get authPasswordRuleSpecialCharacter => 'Contains special character';

  @override
  String get authValidationInvalidEmail => 'Invalid email address';

  @override
  String get loginTitle => 'Welcome Back';

  @override
  String get loginSubtitle => 'Continue your smart rehabilitation journey';

  @override
  String get loginEmailHint => 'name@example.com';

  @override
  String get loginPasswordHint => 'Enter your password';

  @override
  String get loginRememberMe => 'Remember Me';

  @override
  String get loginForgotPassword => 'Forgot Password?';

  @override
  String get loginSigningIn => 'Signing In…';

  @override
  String get loginEnterEmailAndPassword => 'Please enter email and password';

  @override
  String get loginSuccess => 'Login successful';

  @override
  String get loginFailed => 'Login failed. Please try again.';

  @override
  String get loginUnableToSignIn =>
      'Unable to sign in right now. Please try again.';

  @override
  String get loginUnableToDetermineRole =>
      'Unable to determine your account role. Please contact support.';

  @override
  String get loginGoToEmailVerification => 'Go to Email Verification';

  @override
  String get loginNoAccountPrompt => 'Don\'t have an account? ';

  @override
  String get loginShowPassword => 'Show password';

  @override
  String get loginHidePassword => 'Hide password';

  @override
  String get parentDashboardTodaysTasks => 'Today\'s Tasks';

  @override
  String get parentDashboardLatestUpdates => 'Latest Updates';

  @override
  String get parentDashboardSelectChild => 'Select Child';

  @override
  String parentDashboardSelectChildSemantics(String childName) {
    return 'Select child, currently $childName';
  }

  @override
  String get parentDashboardOverallProgress => 'Overall Progress';

  @override
  String get parentDashboardKeepGoing => 'Keep going!';

  @override
  String get parentDashboardViewDetailsArrow => 'View Details →';

  @override
  String get parentDashboardTodaysSummary => 'Today\'s Summary';

  @override
  String get parentDashboardTasksLabel => 'Tasks';

  @override
  String get parentDashboardNoRecentUpdates =>
      'No recent reports or specialist feedback yet.';

  @override
  String get parentDashboardWeeklyProgressReport => 'Weekly Progress Report';

  @override
  String get parentDashboardLatestSpecialistFeedback =>
      'Latest Specialist Feedback';

  @override
  String get parentDashboardAiDailyInsight => 'AI Daily Insight';

  @override
  String get parentDashboardAiAssistantHelp =>
      'Need help understanding your child\'s progress?';

  @override
  String get parentDashboardAiAssistantHint =>
      'Ask about exercises, reports, or daily guidance.';

  @override
  String get parentDashboardAskAi => 'Ask AI';

  @override
  String parentDashboardLastPronunciationScore(int score) {
    return 'Last pronunciation score: $score%';
  }

  @override
  String parentDashboardDeltaFromPrevious(String delta) {
    return '$delta from previous attempt';
  }

  @override
  String get parentDashboardPronunciation => 'Pronunciation';

  @override
  String get parentDashboardFluency => 'Fluency';

  @override
  String get parentDashboardOverall => 'Overall';

  @override
  String get parentDashboardUpdatingInsights => 'Updating child insights...';

  @override
  String get parentDashboardRetryRequired => 'Retry required';

  @override
  String get parentDashboardViewDetails => 'View Details';

  @override
  String get parentDashboardAssignedForToday => 'Assigned for today';

  @override
  String parentDashboardCompletedCount(int completed, int total) {
    return '$completed of $total completed';
  }

  @override
  String get parentDashboardSessionScheduled => 'Session scheduled';

  @override
  String get parentDashboardSessionsScheduled => 'Sessions scheduled';

  @override
  String parentDashboardRehabStreak(int days) {
    return '$days-day rehab streak';
  }

  @override
  String get parentDashboardSelectChildForProgress =>
      'Select a child to view progress.';

  @override
  String get parentDashboardSelectChildForDetails =>
      'Select a child to view details.';

  @override
  String get parentDashboardNoExercisesToday => 'No exercises assigned today.';

  @override
  String get parentDashboardNoReportsYet => 'No reports available yet.';

  @override
  String get parentDashboardConversationUnavailable =>
      'Conversation is not available yet.';

  @override
  String get parentDashboardTasksEmptyAwaitingProfile =>
      'Daily tasks will appear after the child profile is created and a specialist assigns exercises.';

  @override
  String get parentDashboardTasksEmptySelectChild =>
      'Select a child to view today\'s tasks.';

  @override
  String parentDashboardTasksEmptyForChild(String childName) {
    return 'No tasks assigned for $childName today.';
  }

  @override
  String get parentDashboardRehabilitationFollowUp =>
      'Rehabilitation follow-up';

  @override
  String parentDashboardImprovementFromPrevious(String delta) {
    return '$delta improvement from previous attempt';
  }

  @override
  String get parentDashboardRecently => 'Recently';

  @override
  String get parentSessionNoUpcoming => 'No upcoming session';

  @override
  String get parentSessionInOneDay => 'In 1 day';

  @override
  String parentSessionInDays(int count) {
    return 'In $count days';
  }

  @override
  String get parentSessionInOneMinute => 'In 1 minute';

  @override
  String parentSessionInMinutes(int count) {
    return 'In $count minutes';
  }

  @override
  String get parentSessionInOneHour => 'In 1 hour';

  @override
  String parentSessionInHours(int count) {
    return 'In $count hours';
  }

  @override
  String get parentTreatmentJourneyTitle => 'Treatment Journey';

  @override
  String get parentTreatmentJourneySubtitle =>
      'Progress throughout the treatment period';

  @override
  String get parentTreatmentJourneyViewDetails => 'View details';

  @override
  String get parentTreatmentJourneyLoadError =>
      'Couldn\'t load treatment progress.';

  @override
  String get parentTreatmentJourneyEmpty =>
      'Progress will appear after exercises are reviewed.';

  @override
  String parentTreatmentJourneyScoreChangePositive(int points) {
    return '+$points points';
  }

  @override
  String parentTreatmentJourneyScoreChangeNegative(int points) {
    return '$points points';
  }

  @override
  String get parentTreatmentJourneyScoreChangeZero => '0 points';

  @override
  String get parentTreatmentJourneySemanticsLoading =>
      'Treatment Journey, loading progress';

  @override
  String get parentTreatmentJourneySemanticsError =>
      'Treatment Journey, could not load treatment progress';

  @override
  String get parentTreatmentJourneySemanticsEmpty =>
      'Treatment Journey, progress will appear after exercises are reviewed';

  @override
  String parentTreatmentJourneySemanticsLoaded(int score, String trend) {
    return 'Treatment Journey, current progress $score percent, $trend';
  }

  @override
  String get parentDashboardCaseIntakeLoading => 'Loading case requests...';

  @override
  String get parentDashboardCaseIntakeTitle =>
      'Start Your Child\'s Follow-Up Journey';

  @override
  String get parentDashboardCaseIntakeDescription =>
      'Tell us about the observed condition. The admin team will review the request and assign a suitable specialist.';

  @override
  String get parentDashboardCaseIntakeDisclaimer =>
      'The selected category is preliminary and does not represent a medical diagnosis.';

  @override
  String get parentDashboardCaseIntakeSubmitNew => 'Submit New Case Request';

  @override
  String get parentDashboardCaseIntakeViewRequests => 'View Case Requests';

  @override
  String get parentDashboardCaseRequest => 'Case Request';

  @override
  String get parentDashboardCaseConversationPending =>
      'Conversation becomes available after specialist assignment.';

  @override
  String get parentDashboardCaseViewRequest => 'View Request';

  @override
  String get parentDashboardCaseOpenConversation => 'Open Conversation';

  @override
  String get parentDashboardCaseViewAllRequests => 'View All Requests';

  @override
  String get parentDashboardCaseUpdateTitle => 'Case Request Update';

  @override
  String get parentDashboardCaseSubmitAnother => 'Submit Another Request';

  @override
  String get parentDashboardCaseNoRejectionReason =>
      'No rejection reason was provided.';

  @override
  String parentDashboardCaseSubmittedOn(String date) {
    return 'Submitted $date';
  }

  @override
  String get parentProfileEditProfile => 'Edit Profile';

  @override
  String get parentProfilePersonalSection => 'Personal Information';

  @override
  String get parentProfileParentDetails => 'Parent Details';

  @override
  String get parentProfileRelationshipNotes => 'Relationship Notes';

  @override
  String get parentProfileSaveChanges => 'Save Changes';

  @override
  String get parentProfileNotAvailable => 'Profile not available.';

  @override
  String get parentProfileLoading => 'Loading profile...';

  @override
  String get parentProfileUpdatedSuccess => 'Profile updated successfully';

  @override
  String get parentProfileNotSignedIn => 'Not signed in';

  @override
  String get parentProfileFullNameRequired => 'Full name is required';

  @override
  String parentProfileLoadFailed(String error) {
    return 'Failed to load profile: $error';
  }

  @override
  String parentProfileSaveFailed(String error) {
    return 'Failed to save profile: $error';
  }

  @override
  String parentProfileImageUploadFailed(String error) {
    return 'Profile details were saved, but the image upload failed: $error';
  }

  @override
  String parentProfileRefreshAfterSaveFailed(String error) {
    return 'Profile saved, but refresh failed: $error';
  }

  @override
  String get parentProfilePhotoTake => 'Take Photo';

  @override
  String get parentProfilePhotoChooseGallery => 'Choose from Gallery';

  @override
  String get parentProfileImageUploadError => 'Failed to upload profile image.';

  @override
  String get parentNotificationsMarkAllRead => 'Mark all as read';

  @override
  String get parentNotificationsEmpty => 'No notifications yet.';

  @override
  String get parentNotificationsLoading => 'Loading notifications...';

  @override
  String get parentNotificationsSignInRequired =>
      'Please sign in to view notifications.';

  @override
  String parentNotificationsLoadFailed(String error) {
    return 'Failed to load notifications: $error';
  }

  @override
  String get notificationTypeUpdate => 'Update';

  @override
  String get parentChildrenScreenTitle => 'Children';

  @override
  String get parentChildrenNoLinked =>
      'No linked children yet. Add a child from the specialist portal.';

  @override
  String parentChildrenAgeYears(int count) {
    return '$count yrs';
  }

  @override
  String parentChildrenProgressPercent(int percent) {
    return '$percent% progress';
  }

  @override
  String get parentChildrenProgressPending =>
      'Progress will appear once exercises are tracked.';

  @override
  String get parentReportsLoading => 'Loading reports...';

  @override
  String get parentReportsSelectChild => 'Select a child to view reports.';

  @override
  String parentReportsEmptyForChild(String childName) {
    return 'No reports available for $childName.';
  }

  @override
  String get parentReportsOpenReport => 'Open report';

  @override
  String get reportTypeWeekly => 'Weekly';

  @override
  String get reportTypeMonthly => 'Monthly';

  @override
  String get reportTypeDaily => 'Daily';

  @override
  String get reportTypeProgress => 'Progress';

  @override
  String parentExercisesForChild(String childName) {
    return 'Exercises for $childName';
  }

  @override
  String get parentExercisesTabAssigned => 'Assigned';

  @override
  String get parentExercisesLoading => 'Loading exercises...';

  @override
  String get parentExercisesSelectChild => 'Select a child to view exercises.';

  @override
  String parentExercisesNoDailyForChild(String childName) {
    return 'No daily tasks assigned for $childName today.';
  }

  @override
  String parentExercisesNoWeeklyForChild(String childName) {
    return 'No weekly tasks assigned for $childName.';
  }

  @override
  String parentExercisesNoAssignedForChild(String childName) {
    return 'No assigned exercises for $childName yet.';
  }

  @override
  String parentExercisesDueDate(String date) {
    return 'Due $date';
  }

  @override
  String parentExercisesLoadFailed(String error) {
    return 'Failed to load exercises: $error';
  }

  @override
  String get exerciseFrequencyDaily => 'Daily';

  @override
  String get exerciseFrequencyWeekly => 'Weekly';

  @override
  String get exerciseFrequencyMonthly => 'Monthly';

  @override
  String get statusInProgress => 'In Progress';

  @override
  String get parentDashboardSignInRequired =>
      'Please sign in to view the parent dashboard.';

  @override
  String parentDashboardLoadFailed(String error) {
    return 'Failed to load dashboard: $error';
  }

  @override
  String parentDashboardChildDataLoadFailed(String error) {
    return 'Failed to load child data: $error';
  }

  @override
  String get specialistDashboardOverview => 'Overview';

  @override
  String get specialistDashboardActiveCases => 'Active Cases';

  @override
  String get specialistDashboardNoActiveCases =>
      'No active cases assigned yet.';

  @override
  String get specialistDashboardNoPendingReviews =>
      'No pending reviews right now.';

  @override
  String get specialistDashboardRecentPatientProgress =>
      'Recent Patient Progress';

  @override
  String get specialistDashboardNoProgressData =>
      'No progress data available yet.';

  @override
  String get specialistDashboardSignInRequired =>
      'Please sign in as a specialist to view this dashboard.';

  @override
  String specialistDashboardLoadFailed(String error) {
    return 'Failed to load specialist dashboard: $error';
  }

  @override
  String get specialistDashboardThisWeek => 'THIS WEEK';

  @override
  String get specialistDashboardViewCalendar => 'View Calendar';

  @override
  String get specialistDashboardNoUpcomingSessions => 'No upcoming sessions';

  @override
  String get specialistDashboardScheduledSessionsHint =>
      'Your scheduled sessions will appear here.';

  @override
  String get specialistDashboardViewSession => 'View Session →';

  @override
  String get specialistDashboardNoSessionsToday =>
      'No sessions scheduled for today';

  @override
  String get specialistDashboardNoMoreSessionsToday => 'No more sessions today';

  @override
  String specialistDashboardMoreSessionsToday(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count more sessions today',
      one: '1 more session today',
    );
    return '$_temp0';
  }

  @override
  String specialistDashboardNextSessionToday(String time) {
    return 'Today, $time';
  }

  @override
  String specialistDashboardNextSessionTomorrow(String time) {
    return 'Tomorrow, $time';
  }

  @override
  String get specialistDashboardSubmittedRecently => 'Recently submitted';

  @override
  String specialistDashboardSubmittedMinutesAgo(int minutes) {
    return 'Submitted ${minutes}m ago';
  }

  @override
  String specialistDashboardSubmittedHoursAgo(int hours) {
    return 'Submitted ${hours}h ago';
  }

  @override
  String specialistDashboardSubmittedOnDate(String date) {
    return 'Submitted $date';
  }

  @override
  String get specialistPatientProgress => 'Patient Progress';

  @override
  String get statusArchived => 'Archived';

  @override
  String get filterUpcoming => 'Upcoming';

  @override
  String get filterPast => 'Past';

  @override
  String get filterRecent => 'Recent';

  @override
  String get reportTypeAiReports => 'AI Reports';

  @override
  String get reportTypeAi => 'AI';

  @override
  String get entitySessionRequests => 'Requests';

  @override
  String get fieldSpecialization => 'Specialization';

  @override
  String get fieldLicenseNumber => 'License Number';

  @override
  String get fieldYearsOfExperience => 'Years of Experience';

  @override
  String get fieldBio => 'Bio';

  @override
  String get fieldDate => 'Date';

  @override
  String get fieldTime => 'Time';

  @override
  String get fieldLocation => 'Location';

  @override
  String get commonSelected => 'Selected';

  @override
  String get commonCopy => 'Copy';

  @override
  String get commonOpen => 'Open';

  @override
  String get commonApprove => 'Approve';

  @override
  String get commonReject => 'Reject';

  @override
  String get commonProcessing => 'Processing...';

  @override
  String get calendarPreviousMonth => 'Previous month';

  @override
  String get calendarNextMonth => 'Next month';

  @override
  String specialistLoadFailed(String error) {
    return 'Failed to load data: $error';
  }

  @override
  String specialistProgressLoadFailed(String error) {
    return 'Failed to load progress: $error';
  }

  @override
  String specialistReportsLoadFailed(String error) {
    return 'Failed to load reports: $error';
  }

  @override
  String specialistSessionsLoadFailed(String error) {
    return 'Failed to load sessions: $error';
  }

  @override
  String get specialistSessionRequestsSignInRequired =>
      'Please sign in to view session requests.';

  @override
  String specialistSessionRequestsLoadFailed(String error) {
    return 'Failed to load session requests: $error';
  }

  @override
  String get specialistAddTreatmentPlan => 'Add Treatment Plan';

  @override
  String get specialistNoAssignedPatients => 'No assigned patients available.';

  @override
  String get specialistSelectPatient => 'Select patient';

  @override
  String get specialistPatientHasActivePlan =>
      'This patient already has an active treatment plan.';

  @override
  String get specialistNoActivePlan => 'No active plan';

  @override
  String get specialistSearchPlansHint => 'Search by plan title or patient';

  @override
  String get specialistNoTreatmentPlans => 'No treatment plans found.';

  @override
  String get specialistNoPlansMatchFilter =>
      'No plans match your search or filter.';

  @override
  String get specialistAddExercise => 'Add Exercise';

  @override
  String get specialistExerciseLibrary => 'Exercise Library';

  @override
  String get specialistExerciseLibrarySubtitle =>
      'Browse therapy exercises by category and search.';

  @override
  String get specialistSearchExercisesHint =>
      'Search by title, category, or instructions';

  @override
  String get specialistNoExercises =>
      'No exercises available yet. New exercises will appear here once added.';

  @override
  String get specialistNoExercisesMatchFilter =>
      'No exercises match your filters.';

  @override
  String get specialistExerciseIncludesMedia => 'Includes instruction media';

  @override
  String get specialistPatientReports => 'Patient Reports';

  @override
  String get specialistSearchReportsHint => 'Search by patient or title';

  @override
  String get specialistNoReports => 'No reports found.';

  @override
  String get specialistNoReportsForPatient =>
      'No reports found for this patient.';

  @override
  String get specialistNoReportsMatchFilter =>
      'No reports match your search or filter.';

  @override
  String get specialistScheduleSession => 'Schedule Session';

  @override
  String get specialistNoSessions => 'No sessions found.';

  @override
  String get specialistNoSessionsMatchFilter =>
      'No sessions match your search or filter.';

  @override
  String get specialistSearchSessionsHint => 'Search by patient name';

  @override
  String get specialistNoSessionsOnDate =>
      'No sessions scheduled for this date.';

  @override
  String get specialistNoSessionRequests => 'No session requests yet.';

  @override
  String get specialistNoPendingSessionRequests =>
      'No pending session requests.';

  @override
  String get specialistNoSessionRequestsMatchFilter =>
      'No session requests match this filter.';

  @override
  String get specialistSessionRequestPreferredDate => 'Preferred date';

  @override
  String get specialistSessionRequestPreferredTime => 'Preferred time';

  @override
  String get specialistSessionRequestRequested => 'Requested';

  @override
  String specialistSessionScheduledAt(String dateTime) {
    return 'Scheduled: $dateTime';
  }

  @override
  String specialistSessionDurationMinutes(int minutes) {
    return 'Duration: $minutes min';
  }

  @override
  String get specialistSessionRequestRegularFollowUp => 'Regular Follow-up';

  @override
  String get specialistSessionRequestReplacementCancelled =>
      'Replacement for Cancelled Session';

  @override
  String get specialistSessionRequestReplacementMissed =>
      'Replacement for Missed Session';

  @override
  String get specialistSessionRequestAdditionalSession => 'Additional Session';

  @override
  String get specialistSessionRequestConsultation => 'Consultation';

  @override
  String get specialistSessionRequestOther => 'Other';

  @override
  String get specialistSessionRequestDefault => 'Session request';

  @override
  String get statusAssigned => 'Assigned';

  @override
  String adminDashboardWelcome(String userName) {
    return 'Welcome, $userName';
  }

  @override
  String get adminDashboardSubtitle =>
      'Manage your rehabilitation platform from one place.';

  @override
  String get adminDashboardPatientAssignmentsHint =>
      'Assign specialists and link parents to patients';

  @override
  String adminDashboardNewSignupsThisWeek(int count) {
    return '+$count this week';
  }

  @override
  String get adminDashboardThisWeek => 'This week';

  @override
  String get adminDashboardSpecialists => 'Specialists';

  @override
  String get adminDashboardNewSignups => 'New Signups';

  @override
  String get adminDashboardSystemAnalytics => 'System Analytics';

  @override
  String get adminDashboardRecentUsers => 'Recent Users';

  @override
  String get adminDashboardNoUsers => 'No users found.';

  @override
  String get adminDashboardSignInRequired =>
      'Please sign in as an admin to view this dashboard.';

  @override
  String adminDashboardLoadFailed(String error) {
    return 'Failed to load admin dashboard: $error';
  }

  @override
  String get adminSystemActivity => 'System Activity';

  @override
  String get adminSystemActivityEmpty =>
      'No system activity during this period.';

  @override
  String get adminSystemActivityTryAnotherWeek => 'Try selecting another week.';

  @override
  String get adminSystemActivityPreviousWeek => 'Previous week';

  @override
  String get adminSystemActivityNextWeek => 'Next week';

  @override
  String get adminSystemActivitySelectPeriod => 'Select period';

  @override
  String get adminSystemActivityLast2Weeks => 'Last 2 Weeks';

  @override
  String get adminSystemActivityLastMonth => 'Last Month';

  @override
  String adminSystemActivityWeeksAgo(int count) {
    return '$count weeks ago';
  }

  @override
  String get adminSystemActivityEvent => 'event';

  @override
  String get adminSystemActivityEvents => 'events';

  @override
  String adminSystemActivityTooltip(int count, String label) {
    return 'System Activity: $count $label';
  }

  @override
  String get adminSystemActivityLoadFailed =>
      'Failed to load system activity. Please try again.';

  @override
  String get adminUsersSearchHint => 'Search by name, email, or role';

  @override
  String adminUsersLoadFailed(String error) {
    return 'Failed to load users: $error';
  }

  @override
  String get adminUsersDeactivateTitle => 'Deactivate User';

  @override
  String get adminUsersActivateTitle => 'Activate User';

  @override
  String get adminUsersDeactivateConfirm =>
      'Are you sure you want to deactivate this user? They may lose access to the platform.';

  @override
  String get adminUsersActivateConfirm =>
      'Are you sure you want to activate this user?';

  @override
  String adminUsersUpdateStatusFailed(String error) {
    return 'Failed to update user status: $error';
  }

  @override
  String get adminUsersDeletedSuccess => 'User deleted successfully.';

  @override
  String adminUsersSaveFailed(String error) {
    return 'Failed to save user: $error';
  }

  @override
  String get adminActivate => 'Activate';

  @override
  String get adminDeactivate => 'Deactivate';

  @override
  String get adminPatientsSearchHint => 'Search patients or condition';

  @override
  String get adminPatientsFilterCondition => 'Filter by condition';

  @override
  String get adminPatientsAllConditions => 'All conditions';

  @override
  String get adminPatientsNoPatients => 'No patients found.';

  @override
  String adminPatientsLoadFailed(String error) {
    return 'Failed to load patients: $error';
  }

  @override
  String get adminPatientsEditPatient => 'Edit Patient';

  @override
  String get adminPatientsPreviousSession => 'Previous Session';

  @override
  String get adminPatientsNoPreviousSession => 'No previous session';

  @override
  String get adminPatientsUnknownDate => 'Unknown date';

  @override
  String get adminSessionsSearchHint => 'Search patient or specialist';

  @override
  String get adminSessionsFilterStatus => 'Filter by status';

  @override
  String get adminSessionsAllStatuses => 'All statuses';

  @override
  String get adminSessionsNoSessions => 'No sessions found.';

  @override
  String adminSessionsLoadFailed(String error) {
    return 'Failed to load sessions: $error';
  }

  @override
  String adminSessionsSpecialistLabel(String name) {
    return 'Specialist: $name';
  }

  @override
  String adminSessionsDurationMinutes(int minutes) {
    return 'Duration: $minutes min';
  }

  @override
  String get adminSessionsCompleteTitle => 'Complete Session';

  @override
  String get adminSessionsCompleteMessage =>
      'Are you sure you want to mark this session as completed?';

  @override
  String get adminSessionsCompleteConfirm => 'Complete';

  @override
  String get adminSessionsCompleteSuccess => 'Session marked as completed.';

  @override
  String get adminSessionsCancelTitle => 'Cancel Session';

  @override
  String get adminSessionsCancelMessage =>
      'Are you sure you want to cancel this session?';

  @override
  String get adminSessionsCancelConfirm => 'Cancel Session';

  @override
  String get adminSessionsCancelSuccess => 'Session cancelled.';

  @override
  String get adminSessionsNoShowTitle => 'Mark as No Show';

  @override
  String get adminSessionsNoShowMessage =>
      'Are you sure you want to mark this session as no show?';

  @override
  String get adminSessionsNoShowConfirm => 'Mark No Show';

  @override
  String get adminSessionsNoShowSuccess => 'Session marked as no-show.';

  @override
  String adminSessionsUpdateFailed(String error) {
    return 'Failed to update session: $error';
  }

  @override
  String adminAiLoadFailed(String error) {
    return 'Failed to load AI Center: $error';
  }

  @override
  String get adminAiInsights => 'AI Insights';

  @override
  String get adminAiInsightsSubtitle =>
      'Speech analysis, recommendations, and clinical reports';

  @override
  String get adminAiSpeechAnalyses => 'Speech Analyses';

  @override
  String adminAiAvgScore(String score) {
    return 'Avg score $score';
  }

  @override
  String get adminAiRecommendations => 'AI Recommendations';

  @override
  String get adminAiNeedsAttention => 'Needs Attention';

  @override
  String adminAiPendingReviews(int count) {
    return '$count pending reviews';
  }

  @override
  String get adminAiPatientsNeedingAttention => 'Patients Needing Attention';

  @override
  String get adminAiNoPatientsFlagged => 'No patients flagged for low scores.';

  @override
  String get adminAiLatestSpeechAnalyses => 'Latest Speech Analyses';

  @override
  String get adminAiLatestRecommendations => 'Latest AI Recommendations';

  @override
  String get adminAiLatestReports => 'Latest AI Reports';

  @override
  String get adminAiNoRecords => 'No records yet.';

  @override
  String adminAiSpeechScore(String score) {
    return 'Speech $score';
  }

  @override
  String adminAuditLoadFailed(String error) {
    return 'Failed to load audit logs: $error';
  }

  @override
  String get adminAuditFilterByUser => 'Filter by user';

  @override
  String get adminAuditAllUsers => 'All users';

  @override
  String get adminAuditFilterByAction => 'Filter by action';

  @override
  String get adminAuditAllActions => 'All actions';

  @override
  String get adminAuditFilterByEntity => 'Filter by entity';

  @override
  String get adminAuditAllEntities => 'All entities';

  @override
  String get adminAuditFromDate => 'From date';

  @override
  String get adminAuditToDate => 'To date';

  @override
  String adminAuditFromDateValue(String date) {
    return 'From $date';
  }

  @override
  String adminAuditToDateValue(String date) {
    return 'To $date';
  }

  @override
  String get adminAuditNoLogs => 'No audit logs found.';

  @override
  String get adminAssignmentsUnlinkSpecialist => 'Unlink Specialist';

  @override
  String get adminAssignmentsUnlinkParent => 'Unlink Parent';

  @override
  String adminAssignmentsUnlinkSpecialistConfirm(String name) {
    return 'Are you sure you want to unlink $name from this patient?';
  }

  @override
  String adminAssignmentsUnlinkParentConfirm(String name) {
    return 'Are you sure you want to unlink $name from this patient?';
  }

  @override
  String get adminAssignmentsSpecialistUnlinked =>
      'Specialist unlinked successfully.';

  @override
  String get adminAssignmentsParentUnlinked => 'Parent unlinked successfully.';

  @override
  String get adminAssignmentsAssignSpecialist => 'Assign Specialist';

  @override
  String get adminAssignmentsLinkParent => 'Link Parent';

  @override
  String get adminAssignmentsPrimarySpecialist => 'Primary specialist';

  @override
  String get adminAssignmentsAssignSpecialistAction =>
      'Assign Specialist to Patient';

  @override
  String get adminAssignmentsLinkParentAction => 'Link Parent to Patient';

  @override
  String get adminAssignmentsChangeHint =>
      'To change an assignment, unlink the current specialist or parent, then assign or link the new one.';

  @override
  String get adminAssignmentsAssignedSpecialists => 'Assigned Specialists';

  @override
  String get adminAssignmentsLinkedParents => 'Linked Parents';

  @override
  String get adminAssignmentsLoadingRelationships => 'Loading relationships...';

  @override
  String get adminAssignmentsSelectPatient =>
      'Select a patient to view assignments.';

  @override
  String get adminAssignmentsNoSpecialistsAssigned =>
      'No specialists assigned to this patient yet.';

  @override
  String get adminAssignmentsNoParentsLinked =>
      'No parents linked to this patient yet.';

  @override
  String get adminAssignmentsNoPatients => 'No patients available';

  @override
  String get adminAssignmentsNoSpecialists => 'No specialists available';

  @override
  String get adminAssignmentsNoParents => 'No parent accounts available';

  @override
  String get adminAssignmentsRelationship => 'Relationship';

  @override
  String get adminAssignmentsSelectRelationship => 'Select relationship';

  @override
  String get adminAssignmentsPrimaryContact => 'Primary contact';

  @override
  String get adminAssignmentsUnlinkSpecialistTooltip => 'Unlink specialist';

  @override
  String get adminAssignmentsUnlinkParentTooltip => 'Unlink parent';

  @override
  String get adminAssignmentsGuardian => 'Guardian';

  @override
  String get adminUnlink => 'Unlink';

  @override
  String get adminCaseRequestsDescription =>
      'Review preliminary child case requests and track their current status.';

  @override
  String get adminCaseRequestsSearchLabel => 'Search by child name';

  @override
  String get adminCaseRequestsSearchHint => 'Enter child name';

  @override
  String get adminCaseRequestsClearSearch => 'Clear search';

  @override
  String get adminCaseRequestsClearFilters => 'Clear Filters';

  @override
  String get adminCaseRequestsNoMatch =>
      'No requests match the selected filters.';

  @override
  String get adminCaseRequestsEmpty => 'No case requests found.';

  @override
  String get adminCaseRequestsAllStatuses => 'All Statuses';

  @override
  String get adminCaseRequestsAllCategories => 'All Categories';

  @override
  String get adminCaseRequestsConvertedToPatient => 'Converted to Patient';

  @override
  String get adminClearFilters => 'Clear filters';

  @override
  String get adminFieldStatus => 'Status';

  @override
  String get adminFieldCategory => 'Category';

  @override
  String get adminProfilePhotoUpdated => 'Profile photo updated successfully.';

  @override
  String get adminRecordFallback => 'Record';

  @override
  String get commonOpening => 'Opening...';

  @override
  String get statusReviewed => 'Reviewed';

  @override
  String get statusNeedsRetry => 'Needs retry';

  @override
  String get goalTermShortTerm => 'Short-term';

  @override
  String get goalTermLongTerm => 'Long-term';

  @override
  String get mediaTypeAudio => 'Audio';

  @override
  String get mediaTypeVideo => 'Video';

  @override
  String get mediaTypeImage => 'Image';

  @override
  String get specialistPatientDetailsTitle => 'Patient Details';

  @override
  String get specialistPatientDetailsNoteSaved => 'Note saved';

  @override
  String get specialistPatientDetailsNoParentLinked =>
      'No parent is linked to this patient yet.';

  @override
  String get specialistPatientDetailsActivePlanRequired =>
      'An active treatment plan is required before assigning an exercise.';

  @override
  String get specialistPatientDetailsNotFound => 'Patient not found.';

  @override
  String get specialistPatientDetailsNoTreatmentPlan =>
      'No treatment plan found for this patient.';

  @override
  String specialistPatientDetailsLoadFailed(String error) {
    return 'Failed to load patient details: $error';
  }

  @override
  String specialistPatientDetailsSaveNoteFailed(String error) {
    return 'Failed to save note: $error';
  }

  @override
  String get specialistPatientDetailsSaveNoteFailedGeneric =>
      'Failed to save note';

  @override
  String get specialistPatientDetailsUpdateFailed => 'Failed to update patient';

  @override
  String get specialistPatientDetailsQuickStatistics => 'Quick Statistics';

  @override
  String get specialistPatientDetailsGoalsSectionUnavailable =>
      'Goals section is not available yet. Pull to refresh and try again.';

  @override
  String get specialistPatientDetailsAssignedExercisesSectionUnavailable =>
      'Assigned Exercises section is not available yet. Pull to refresh and try again.';

  @override
  String get specialistPatientDetailsSubmissionsSectionUnavailable =>
      'Submissions section is not available yet. Pull to refresh and try again.';

  @override
  String get specialistPatientDetailsReportsUnavailable =>
      'Reports are unavailable right now.';

  @override
  String get specialistPatientDetailsNoTreatmentPlanYet =>
      'No treatment plan assigned yet.';

  @override
  String get specialistPatientDetailsNoGoals =>
      'No goals defined for this patient.';

  @override
  String get specialistPatientDetailsNoExercises =>
      'No exercises assigned yet.';

  @override
  String get specialistPatientDetailsRecentSubmissions =>
      'Recent Exercise Submissions';

  @override
  String get specialistPatientDetailsNoSubmissions =>
      'No exercise submissions yet.';

  @override
  String get specialistPatientDetailsLatestNotes => 'Latest Specialist Notes';

  @override
  String get specialistPatientDetailsNoNotes => 'No specialist notes yet.';

  @override
  String get specialistPatientDetailsActiveGoals => 'Active Goals';

  @override
  String get specialistPatientDetailsAssignedExercises => 'Assigned Exercises';

  @override
  String specialistPatientDetailsAgeDiagnosis(String age, String diagnosis) {
    return 'Age $age • $diagnosis';
  }

  @override
  String get specialistPatientDetailsNoDiagnosis => 'No diagnosis recorded';

  @override
  String get specialistPatientDetailsStartDate => 'Start date';

  @override
  String get specialistPatientDetailsEndDate => 'End date';

  @override
  String get specialistPatientDetailsAchieved => 'Achieved';

  @override
  String specialistPatientDetailsTargetValue(String value) {
    return 'Target value: $value';
  }

  @override
  String specialistPatientDetailsTargetDate(String date) {
    return 'Target date: $date';
  }

  @override
  String specialistPatientDetailsPercentComplete(int percent) {
    return '$percent% complete';
  }

  @override
  String get specialistPatientDetailsNoDueDate => 'No due date';

  @override
  String get specialistPatientDetailsEnterClinicalNote =>
      'Enter clinical note...';

  @override
  String get specialistReviewExercises => 'Review Exercises';

  @override
  String get specialistAddSpecialistNote => 'Add Specialist Note';

  @override
  String get specialistViewReports => 'View Reports';

  @override
  String get specialistEditTreatmentPlan => 'Edit Treatment Plan';

  @override
  String get specialistCreateTreatmentPlan => 'Create Treatment Plan';

  @override
  String get specialistManageGoals => 'Manage Goals';

  @override
  String get specialistAssignExercise => 'Assign Exercise';

  @override
  String get specialistMessageParent => 'Message Parent';

  @override
  String get specialistFamilyPatternInsightTitle => 'Family Pattern Insight';

  @override
  String get specialistFamilyPatternLoading =>
      'Loading family pattern insight…';

  @override
  String get specialistFamilyPatternUnavailable =>
      'Family pattern insight is unavailable right now.';

  @override
  String get specialistFamilyPatternNoPatternsDetected =>
      'No repeated clinical characteristics were detected in the available records.';

  @override
  String get specialistFamilyPatternClinicalSummary => 'Clinical Summary';

  @override
  String get specialistFamilyPatternPatternScore => 'Pattern Score';

  @override
  String specialistFamilyPatternScoreSemantics(int score, String caption) {
    return 'Pattern score $score out of 100. $caption';
  }

  @override
  String get specialistFamilyPatternScoreCaptionHigh =>
      'High confidence based on available records.';

  @override
  String get specialistFamilyPatternScoreCaptionModerate =>
      'Moderate repeated characteristics detected.';

  @override
  String get specialistFamilyPatternScoreCaptionLow =>
      'Limited repeated characteristics detected.';

  @override
  String get specialistFamilyPatternEvidenceHigh => 'High Evidence';

  @override
  String get specialistFamilyPatternEvidenceModerate => 'Moderate Evidence';

  @override
  String get specialistFamilyPatternEvidenceLow => 'Low Evidence';

  @override
  String get specialistFamilyPatternEvidenceSemanticHigh =>
      'High evidence of repeated characteristics';

  @override
  String get specialistFamilyPatternEvidenceSemanticModerate =>
      'Moderate evidence of repeated characteristics';

  @override
  String get specialistFamilyPatternEvidenceSemanticLow =>
      'Low evidence of repeated characteristics';

  @override
  String specialistFamilyPatternMatchedChildrenOne(int count) {
    return '$count Child Matched';
  }

  @override
  String specialistFamilyPatternMatchedChildrenMany(int count) {
    return '$count Children Matched';
  }

  @override
  String get specialistFamilyPatternMatchedAtLeastOne =>
      'Matched at least one detected pattern.';

  @override
  String get specialistFamilyPatternShowFewerFindings => 'Show fewer findings';

  @override
  String get specialistFamilyPatternViewAllFindings => 'View all findings';

  @override
  String get specialistFamilyPatternReviewMatchedChildren =>
      'Review Matched Children';

  @override
  String get specialistFamilyPatternSharedDiagnosis => 'Shared Diagnosis';

  @override
  String get specialistFamilyPatternSharedCaseCategory =>
      'Shared Case Category';

  @override
  String get specialistFamilyPatternObservedDifficulties =>
      'Observed Difficulties';

  @override
  String get specialistFamilyPatternPreviousDiagnosis => 'Previous Diagnosis';

  @override
  String get specialistFamilyPatternFamilyHistory => 'Family History';

  @override
  String get specialistFamilyPatternRepeatedCharacteristic =>
      'Repeated Characteristic';

  @override
  String get specialistFamilyPatternDetailsTitle => 'Family Pattern Details';

  @override
  String get specialistFamilyPatternDetailsSubtitle =>
      'Review which linked children matched each detected pattern.';

  @override
  String get specialistFamilyPatternLoadDetailsFailed =>
      'Unable to load matched children details.';

  @override
  String get specialistFamilyPatternNoDetailedMatches =>
      'No detailed matches are available.';

  @override
  String get specialistFamilyPatternHiddenMatchesOne =>
      'Some matched children are not shown because you are not assigned to their records.';

  @override
  String specialistFamilyPatternHiddenMatchesMany(int count) {
    return '$count matched children are not shown because you are not assigned to their records.';
  }

  @override
  String get specialistFamilyPatternSharedTerms => 'Shared terms:';

  @override
  String specialistFamilyPatternMatchedValue(String value) {
    return 'Matched value: $value';
  }

  @override
  String get specialistFamilyPatternAddClinicalNote => 'Add Clinical Note';

  @override
  String get specialistFamilyPatternContactParent => 'Contact Parent';

  @override
  String get specialistFamilyPatternScheduleFollowUp => 'Schedule Follow-up';
}
