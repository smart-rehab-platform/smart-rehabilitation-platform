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
}
