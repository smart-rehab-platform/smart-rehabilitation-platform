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
  String get fieldDateOfBirth => 'Date of Birth';

  @override
  String get fieldGender => 'Gender';

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

  @override
  String get commonPleaseWait => 'Please wait…';

  @override
  String get specialistTreatmentPlanSaveChanges => 'Save Changes';

  @override
  String get specialistTreatmentPlanCreatedSuccess =>
      'Treatment plan created successfully';

  @override
  String get specialistTreatmentPlanUpdatedSuccess =>
      'Treatment plan updated successfully';

  @override
  String get specialistTreatmentPlanNotFound => 'Treatment plan not found.';

  @override
  String get specialistTreatmentPlanNewPlansActiveHelper =>
      'New plans are created as Active.';

  @override
  String get specialistTreatmentPlanTitleLabel => 'Plan title';

  @override
  String get specialistTreatmentPlanTitleHint => 'Treatment plan title';

  @override
  String get specialistTreatmentPlanCreating => 'Creating...';

  @override
  String get specialistTreatmentPlanCurrentGoals => 'Current Goals';

  @override
  String get specialistTreatmentPlanNoGoalsForPlan =>
      'No goals defined for this plan.';

  @override
  String get specialistTreatmentPlanSelectDate => 'Select date';

  @override
  String get specialistTreatmentPlanPatientRequired => 'Patient is required';

  @override
  String get specialistTreatmentPlanTitleRequired => 'Plan title is required';

  @override
  String get specialistTreatmentPlanStartDateRequired =>
      'Start date is required';

  @override
  String get specialistTreatmentPlanEndDateBeforeStart =>
      'End date cannot be before start date';

  @override
  String get specialistTreatmentPlanCreateFailed =>
      'Failed to create treatment plan. Please try again.';

  @override
  String specialistTreatmentPlanLoadFailed(String error) {
    return 'Failed to load treatment plan: $error';
  }

  @override
  String get specialistTreatmentPlanSaveFailed =>
      'Failed to save treatment plan. Please try again.';

  @override
  String get specialistGoalsCreatedSuccess => 'Goal created successfully';

  @override
  String get specialistGoalsUpdatedSuccess => 'Goal updated successfully';

  @override
  String get specialistGoalsProgressUpdatedSuccess =>
      'Progress updated successfully';

  @override
  String get specialistGoalsMarkedAchievedSuccess => 'Goal marked as achieved';

  @override
  String get specialistGoalsCouldNotLoad => 'Goals could not be loaded.';

  @override
  String get specialistGoalsNoActivePlanForPatient =>
      'No active treatment plan found for this patient.';

  @override
  String get specialistGoalsNoGoalsForPlan =>
      'No goals defined for this treatment plan.';

  @override
  String get specialistGoalsAddNewGoal => 'Add New Goal';

  @override
  String get specialistGoalsUpdateProgress => 'Update Progress';

  @override
  String get specialistGoalsEditGoal => 'Edit Goal';

  @override
  String get specialistGoalsArchiveGoal => 'Archive Goal';

  @override
  String get specialistGoalsMarkedAchievedHelper =>
      'This goal is marked as achieved.';

  @override
  String get specialistGoalsAddDialogTitle => 'Add New Goal';

  @override
  String get specialistGoalsEditDialogTitle => 'Edit Goal';

  @override
  String get specialistGoalsUpdateProgressDialogTitle => 'Update Progress';

  @override
  String get specialistGoalsArchiveDialogTitle => 'Archive Goal';

  @override
  String get specialistGoalsArchiveDialogBody =>
      'There is no dedicated archive endpoint. This will mark the goal as achieved using PATCH /goals/:id/achieve.';

  @override
  String get specialistGoalsMarkAchieved => 'Mark as Achieved';

  @override
  String get specialistGoalsGoalType => 'Goal type';

  @override
  String get specialistGoalsTitleHint => 'Goal title';

  @override
  String get specialistGoalsTargetValueOptional => 'Target value (optional)';

  @override
  String get specialistGoalsTargetDateOptional => 'Target date (optional)';

  @override
  String get specialistGoalsDescriptionOptional => 'Description (optional)';

  @override
  String get specialistGoalsTitleRequired => 'Goal title is required';

  @override
  String get specialistGoalsTargetValueMustBeNumber =>
      'Target value must be a number';

  @override
  String get specialistGoalsProgressRangeValidation =>
      'Enter a progress value between 0 and 100';

  @override
  String get specialistGoalsProgressRangeProvider =>
      'Progress must be between 0 and 100';

  @override
  String get specialistGoalsCompletionPercentageHint =>
      'Completion percentage (0–100)';

  @override
  String get specialistGoalsProgressNoteOptional => 'Progress note (optional)';

  @override
  String get specialistGoalsSaveProgress => 'Save Progress';

  @override
  String get specialistGoalsAddGoal => 'Add Goal';

  @override
  String get specialistGoalsMarkAsAchieved => 'Mark as achieved';

  @override
  String get specialistGoalsNoActivePlan => 'No active treatment plan found';

  @override
  String specialistGoalsLoadFailed(String error) {
    return 'Failed to load goals: $error';
  }

  @override
  String specialistGoalsRefreshFailed(String error) {
    return 'Failed to refresh goals: $error';
  }

  @override
  String specialistGoalsCreateFailed(String error) {
    return 'Failed to create goal: $error';
  }

  @override
  String specialistGoalsUpdateFailed(String error) {
    return 'Failed to update goal: $error';
  }

  @override
  String specialistGoalsProgressUpdateFailed(String error) {
    return 'Failed to update progress: $error';
  }

  @override
  String specialistGoalsArchiveFailed(String error) {
    return 'Failed to archive goal: $error';
  }

  @override
  String get languageEnglish => 'English';

  @override
  String get languageArabic => 'Arabic';

  @override
  String get commonClear => 'Clear';

  @override
  String get exerciseFrequencyOneTime => 'One time';

  @override
  String get specialistExerciseEditExercise => 'Edit Exercise';

  @override
  String get specialistExerciseDetailsTitle => 'Exercise Details';

  @override
  String get specialistExerciseFormSubtitle =>
      'Add therapy exercises to the shared library for assignment.';

  @override
  String get specialistExerciseCategoriesLoadFailed =>
      'Failed to load categories. Please retry.';

  @override
  String get specialistExerciseNoCategories =>
      'No exercise categories available yet.';

  @override
  String get specialistExerciseNotFound => 'Exercise not found.';

  @override
  String get specialistExerciseLoadFailed =>
      'Failed to load exercise. Please try again.';

  @override
  String get specialistExerciseDetailsLoadFailed =>
      'Failed to load exercise details.';

  @override
  String get specialistExerciseChooseImage => 'Choose image';

  @override
  String get specialistExerciseChooseVideo => 'Choose video';

  @override
  String get specialistExerciseChooseAudioFile => 'Choose audio / file';

  @override
  String get specialistExerciseUnableReadFile =>
      'Unable to read the selected file.';

  @override
  String get specialistExerciseUnsupportedMediaType =>
      'Unsupported media type. Use image, audio, PDF, or MP4/MOV video.';

  @override
  String get specialistExerciseFileTooLarge =>
      'File is too large. Maximum size is 50 MB.';

  @override
  String get specialistExerciseSelectCategory => 'Please select a category.';

  @override
  String get specialistExerciseTitleRequired => 'Title is required.';

  @override
  String get specialistExerciseLanguageField => 'Exercise Language';

  @override
  String get specialistExerciseCategoryField => 'Category';

  @override
  String get specialistExerciseTitleField => 'Title';

  @override
  String get specialistExerciseDescriptionOptional => 'Description (optional)';

  @override
  String get specialistExerciseInstructionsField => 'Detailed instructions';

  @override
  String get specialistExerciseInstructionMediaSection =>
      'Instructional media (optional)';

  @override
  String get specialistExerciseCurrentMediaAttached => 'Current media attached';

  @override
  String get specialistExerciseNoMediaSelected =>
      'No media selected. Images, audio, PDF, and MP4/MOV video are supported (max 50 MB).';

  @override
  String get specialistExerciseReplaceMedia => 'Replace media';

  @override
  String get specialistExerciseAddMedia => 'Add media';

  @override
  String get specialistExerciseRemoveMediaTooltip => 'Remove media';

  @override
  String get specialistExerciseUploadingMedia => 'Uploading media...';

  @override
  String get specialistExerciseCreateExercise => 'Create Exercise';

  @override
  String get specialistExerciseCreatedSuccess =>
      'Exercise created successfully';

  @override
  String get specialistExerciseUpdatedSuccess =>
      'Exercise updated successfully';

  @override
  String get specialistExerciseSaveFailed =>
      'Failed to save exercise. Please try again.';

  @override
  String specialistExerciseLanguageLine(String language) {
    return 'Language: $language';
  }

  @override
  String specialistExerciseCreatedBy(String name) {
    return 'Created by $name';
  }

  @override
  String get specialistExerciseDescriptionSection => 'Description';

  @override
  String get specialistExerciseNoDescription => 'No description available.';

  @override
  String get specialistExerciseInstructionsSection => 'Instructions';

  @override
  String get specialistExerciseNoInstructions => 'No instructions available.';

  @override
  String get specialistExerciseInstructionMediaTitle => 'Instruction Media';

  @override
  String get specialistAssignExerciseSubtitle =>
      'Choose an exercise, then set frequency and dates.';

  @override
  String get specialistAssignExerciseSelectRequired =>
      'Please select an exercise.';

  @override
  String get specialistAssignExerciseSuccess =>
      'Exercise assigned successfully';

  @override
  String get specialistAssignExerciseAssigning => 'Assigning...';

  @override
  String get specialistAssignExerciseNoMatchSearch =>
      'No exercises match your search or filter.';

  @override
  String get specialistAssignExerciseSelectedExercise => 'Selected exercise';

  @override
  String get specialistAssignExerciseFrequency => 'Frequency';

  @override
  String get specialistAssignExerciseDueDateOptional => 'Due date (optional)';

  @override
  String get specialistAssignExerciseSetDueDate => 'Set due date';

  @override
  String get specialistAssignExerciseFailed =>
      'Failed to assign exercise. Please try again.';

  @override
  String get specialistAssignExerciseRequirementsMissing =>
      'Patient, treatment plan, and exercise are required to assign.';

  @override
  String get specialistAssignedExerciseTitle => 'Assigned Exercise';

  @override
  String get specialistAssignedExerciseNotFound =>
      'Assigned exercise not found.';

  @override
  String get specialistAssignedExerciseLoadFailed =>
      'Failed to load assigned exercise.';

  @override
  String get specialistAssignedExerciseAssignmentSection => 'Assignment';

  @override
  String get specialistAssignedExerciseFrequency => 'Frequency';

  @override
  String get specialistAssignedExerciseAssigned => 'Assigned';

  @override
  String get specialistAssignedExerciseDueDate => 'Due date';

  @override
  String get specialistAssignedExerciseLatestSubmission => 'Latest Submission';

  @override
  String get specialistAssignedExerciseNoSubmissions =>
      'No submissions for this assignment yet.';

  @override
  String get specialistAssignedExerciseRecentlySubmitted =>
      'Recently submitted';

  @override
  String get specialistAssignedExerciseOpenLibraryExercise =>
      'Open library exercise';

  @override
  String get specialistAssignedExerciseInstructionalMedia =>
      'Instructional Media';

  @override
  String get priorityHigh => 'High';

  @override
  String get priorityMedium => 'Medium';

  @override
  String get specialistReviewExerciseTitle => 'Review Exercise';

  @override
  String get specialistReviewUploadedMedia => 'Uploaded Media';

  @override
  String get specialistReviewNoMedia =>
      'No media uploaded for this submission.';

  @override
  String get specialistReviewSection => 'Review';

  @override
  String get specialistReviewRating => 'Rating';

  @override
  String get specialistReviewFeedback => 'Feedback';

  @override
  String get specialistReviewFeedbackHint =>
      'Write feedback for the parent and patient...';

  @override
  String get specialistReviewSubmitReview => 'Submit Review';

  @override
  String get specialistReviewUpdateReview => 'Update Review';

  @override
  String get specialistReviewSubmitting => 'Submitting...';

  @override
  String get specialistReviewSubmittedSuccess =>
      'Review submitted successfully';

  @override
  String get specialistReviewSubmissionNotFound => 'Submission not found.';

  @override
  String get specialistReviewSignInRequired =>
      'Please sign in to submit a review.';

  @override
  String specialistReviewLoadFailed(String error) {
    return 'Failed to load submission: $error';
  }

  @override
  String specialistReviewSubmitFailed(String error) {
    return 'Failed to submit review: $error';
  }

  @override
  String get specialistReviewViewSpeechAnalysis => 'View Speech Analysis';

  @override
  String get specialistSubmissionMediaUnavailable => 'Media file unavailable.';

  @override
  String get specialistSubmissionUnsupportedMediaPreview =>
      'Unsupported media type for preview.';

  @override
  String get specialistSubmissionUnableLoadVideo => 'Unable to load video.';

  @override
  String get specialistSubmissionUnableLoadAudio => 'Unable to load audio.';

  @override
  String get specialistSubmissionUploadTimeUnavailable =>
      'Upload time unavailable';

  @override
  String get statusFailed => 'Failed';

  @override
  String get specialistSpeechAnalysisResultsSubtitle =>
      'Speech analysis results';

  @override
  String specialistSpeechAnalysisLatestLine(String dateTime) {
    return 'Latest: $dateTime';
  }

  @override
  String specialistSpeechAnalysisSubmissionLine(String id) {
    return 'Submission $id';
  }

  @override
  String get specialistSpeechAnalysisScores => 'Scores';

  @override
  String get specialistSpeechAnalysisTranscript => 'Transcript';

  @override
  String specialistSpeechAnalysisLanguageLine(String language) {
    return 'Language: $language';
  }

  @override
  String specialistSpeechAnalysisDurationLine(String seconds) {
    return 'Duration: ${seconds}s';
  }

  @override
  String get specialistSpeechAnalysisNoTranscript =>
      'No transcript available for this analysis.';

  @override
  String get specialistSpeechAnalysisComparisonTitle =>
      'Comparison with Previous';

  @override
  String specialistSpeechAnalysisPreviousLine(String date) {
    return 'Previous: $date';
  }

  @override
  String get specialistSpeechAnalysisTrendBaseline => 'Baseline';

  @override
  String get specialistSpeechAnalysisTrendDeclining => 'Declining';

  @override
  String get specialistSpeechAnalysisAiFeedbackTitle =>
      'AI Feedback & Recommendations';

  @override
  String get specialistSpeechAnalysisImprovementSummary =>
      'Improvement Summary';

  @override
  String get specialistSpeechAnalysisClinicalNote => 'Clinical Note';

  @override
  String get specialistSpeechAnalysisRecommendedAction => 'Recommended Action';

  @override
  String get specialistSpeechAnalysisRecommendations => 'Recommendations';

  @override
  String get specialistSpeechAnalysisTreatmentAnalysis => 'Treatment Analysis';

  @override
  String get specialistSpeechAnalysisDecisionSupport => 'Decision Support';

  @override
  String specialistSpeechAnalysisSuggestedLine(String action) {
    return 'Suggested: $action';
  }

  @override
  String get specialistSpeechAnalysisOverallScoreTrend => 'Overall Score Trend';

  @override
  String get specialistSpeechAnalysisUnknownDate => 'Unknown date';

  @override
  String specialistSpeechAnalysisHistorySummary(
    String overall,
    String pronunciation,
  ) {
    return 'Overall $overall • Pronunciation $pronunciation';
  }

  @override
  String get specialistSpeechAnalysisRunTitle => 'Run Speech Analysis';

  @override
  String get specialistSpeechAnalysisRunSubtitle =>
      'Analyze the audio from this exercise submission using speech recognition.';

  @override
  String get specialistSpeechAnalysisAnalyzing => 'Analyzing...';

  @override
  String get specialistSpeechAnalysisAnalyzeSubmission => 'Analyze Submission';

  @override
  String get specialistSpeechAnalysisLatestSummary => 'Latest Analysis Summary';

  @override
  String get specialistSpeechAnalysisHistory => 'Analysis History';

  @override
  String get specialistSpeechAnalysisEmptyResults =>
      'No speech analysis results yet. Run analysis on an audio submission to get started.';

  @override
  String get specialistSpeechAnalysisEmptyHistory =>
      'No previous speech analyses recorded.';

  @override
  String get specialistSpeechAnalysisNoSubmissionSelected =>
      'No submission selected for speech analysis.';

  @override
  String get specialistSpeechAnalysisExistingLoaded =>
      'Existing speech analysis loaded.';

  @override
  String get specialistSpeechAnalysisCompletedSuccess =>
      'Speech analysis completed successfully.';

  @override
  String get specialistSpeechAnalysisAnalyzeFailed =>
      'Speech analysis could not be completed. Please try again.';

  @override
  String get specialistSpeechAnalysisLoadFailed =>
      'Failed to load speech analysis. Please try again.';

  @override
  String get specialistSpeechAnalysisPermissionDenied =>
      'You do not have permission to analyze this submission.';

  @override
  String get specialistSpeechAnalysisNotAvailableYet =>
      'No speech analysis is available for this submission yet.';

  @override
  String get specialistSpeechAnalysisSubmissionNotFound =>
      'The exercise submission could not be found.';

  @override
  String get specialistSpeechAnalysisUnsupportedAudio =>
      'This submission does not contain a supported audio recording.';

  @override
  String get specialistSpeechAnalysisServiceUnavailable =>
      'The speech analysis service is currently unavailable. Please try again.';

  @override
  String get specialistSpeechAnalysisConnectionFailed =>
      'Unable to connect to the analysis service. Check your connection and try again.';

  @override
  String get specialistSpeechAnalysisSourceUploaded => 'Uploaded';

  @override
  String get specialistSpeechAnalysisSourceRecorded => 'Recorded';

  @override
  String get specialistSessionDetailsTitle => 'Session Details';

  @override
  String get specialistSessionNotFound => 'Session not found.';

  @override
  String get specialistSessionLoadFailed => 'Failed to load session details.';

  @override
  String get specialistSessionPermissionDenied =>
      'You do not have permission to manage this session.';

  @override
  String get specialistSessionUpdateBlocked =>
      'This session cannot be updated. Check the details and try again.';

  @override
  String get specialistSessionPatientProfileUnavailable =>
      'Patient profile is unavailable.';

  @override
  String get specialistSessionKeepSession => 'Keep Session';

  @override
  String get specialistSessionMarkCompletedTitle => 'Mark as Completed';

  @override
  String get specialistSessionMarkCompletedMessage =>
      'Mark this session as completed? This cannot be undone.';

  @override
  String get specialistSessionMarkCompletedConfirm => 'Mark Completed';

  @override
  String get specialistSessionMarkedCompleted => 'Session marked as completed.';

  @override
  String get specialistSessionMarkNoShowTitle => 'Mark as No Show';

  @override
  String get specialistSessionMarkNoShowMessage =>
      'Mark this session as no show? This cannot be undone.';

  @override
  String get specialistSessionMarkNoShowConfirm => 'Mark No Show';

  @override
  String get specialistSessionMarkedNoShow => 'Session marked as no show.';

  @override
  String get specialistSessionCancelTitle => 'Cancel Session';

  @override
  String get specialistSessionCancelMessage =>
      'Cancel this session? This cannot be undone.';

  @override
  String get specialistSessionCancelReasonOptional =>
      'Cancellation reason (optional)';

  @override
  String get specialistSessionCancelled => 'Session cancelled.';

  @override
  String get specialistSessionNoMeetingLink =>
      'No valid meeting link available.';

  @override
  String get specialistSessionMeetingLinkCopied => 'Meeting link copied.';

  @override
  String get specialistSessionCouldNotOpenMeetingLink =>
      'Could not open the meeting link. Please try again.';

  @override
  String get specialistSessionStartTime => 'Start time';

  @override
  String get specialistSessionEndTime => 'End time';

  @override
  String get specialistSessionDuration => 'Duration';

  @override
  String specialistSessionMinutesValue(int minutes) {
    return '$minutes min';
  }

  @override
  String get specialistSessionMeetingLink => 'Meeting Link';

  @override
  String get specialistSessionNotProvided => 'Not provided';

  @override
  String get specialistSessionOpenMeeting => 'Open Meeting';

  @override
  String get specialistSessionCopyLink => 'Copy Link';

  @override
  String get specialistSessionViewPatientProfile => 'View Patient Profile';

  @override
  String get specialistSessionActions => 'Actions';

  @override
  String get specialistSessionEditSession => 'Edit Session';

  @override
  String get specialistSessionMarkAsCompleted => 'Mark as Completed';

  @override
  String get specialistSessionMarkAsNoShow => 'Mark as No Show';

  @override
  String get specialistSessionCancellationReason => 'Cancellation reason';

  @override
  String specialistSessionLockedCannotEdit(String status) {
    return 'This session is $status and can no longer be edited.';
  }

  @override
  String get specialistSessionCompleteFailed =>
      'Failed to mark session completed.';

  @override
  String get specialistSessionCancelFailed => 'Failed to cancel session.';

  @override
  String get specialistSessionNoShowFailed =>
      'Failed to mark session as no show.';

  @override
  String get specialistSessionUpdateFailed => 'Failed to update session.';

  @override
  String get specialistSessionCreateFailed => 'Failed to create session.';

  @override
  String get specialistSessionEditTitle => 'Edit Session';

  @override
  String get specialistSessionUpdateSubtitle =>
      'Update the session schedule details.';

  @override
  String get specialistSessionCreateSubtitle =>
      'Schedule a session for one of your assigned patients.';

  @override
  String get specialistSessionTypeTitle => 'Session type / title';

  @override
  String get specialistSessionTypeHint => 'Therapy Session';

  @override
  String get specialistSessionSelectPatient => 'Select patient';

  @override
  String get specialistSessionSelectPatientRequired =>
      'Select an assigned patient.';

  @override
  String get specialistSessionTitleRequired => 'Enter a session type or title.';

  @override
  String get specialistSessionDurationRangeError =>
      'Duration must be between 1 and 480 minutes.';

  @override
  String get specialistSessionScheduleFutureRequired =>
      'Scheduled date and time must be in the future.';

  @override
  String get specialistSessionNoAssignedPatients =>
      'No assigned patients found. Assign a patient before scheduling.';

  @override
  String get specialistSessionLocationOrLink => 'Location or meeting link';

  @override
  String get specialistSessionLocationHint => 'Clinic room or https://…';

  @override
  String get specialistSessionNotesOptional => 'Notes (optional)';

  @override
  String get specialistSessionNotesHint =>
      'Additional details for this session';

  @override
  String get specialistSessionFormHelper =>
      'Title and notes are kept for this form. The server stores patient, schedule, duration, and location/link.';

  @override
  String get specialistSessionUpdatedSuccess => 'Session updated successfully.';

  @override
  String get specialistSessionScheduledSuccess =>
      'Session scheduled successfully.';

  @override
  String specialistSessionCannotEditStatus(String status) {
    return 'This session is $status and cannot be edited.';
  }

  @override
  String get specialistSessionRequestApproveTitle => 'Approve Session Request';

  @override
  String get specialistSessionRequestRejectTitle => 'Reject Session Request';

  @override
  String get specialistSessionRequestRejectSubtitle =>
      'Provide a reason so the parent understands why this request was declined.';

  @override
  String get specialistSessionRequestScheduledDate => 'Scheduled Date';

  @override
  String get specialistSessionRequestScheduledTime => 'Scheduled Time';

  @override
  String get specialistSessionRequestDurationField => 'Duration (minutes)';

  @override
  String get specialistSessionRequestMeetingLinkOrLocation =>
      'Meeting Link or Location';

  @override
  String get specialistSessionRequestApproveCreate =>
      'Approve & Create Session';

  @override
  String get specialistSessionRequestApproving => 'Approving...';

  @override
  String get specialistSessionRequestRejecting => 'Rejecting...';

  @override
  String get specialistSessionRequestRejectConfirm => 'Reject Request';

  @override
  String get specialistSessionRequestRejectReason => 'Rejection Reason';

  @override
  String get specialistSessionRequestRejectReasonHint =>
      'Explain why this request cannot be approved';

  @override
  String get specialistSessionRequestRejectReasonRequired =>
      'Rejection reason is required.';

  @override
  String get specialistSessionRequestApprovedSuccess =>
      'Session request approved and session created.';

  @override
  String get specialistSessionRequestRejectedSuccess =>
      'Session request rejected.';

  @override
  String specialistSessionRequestApproveFailed(String error) {
    return 'Failed to approve session request: $error';
  }

  @override
  String specialistSessionRequestRejectFailed(String error) {
    return 'Failed to reject session request: $error';
  }

  @override
  String get specialistSessionRequestPreferredTimeMorning => 'Morning';

  @override
  String get specialistSessionRequestPreferredTimeAfternoon => 'Afternoon';

  @override
  String get specialistSessionRequestPreferredTimeEvening => 'Evening';

  @override
  String get specialistSessionRequestPreferredTimeFlexible => 'Flexible';

  @override
  String get specialistSessionLinkCopied => 'Link copied';

  @override
  String get specialistSessionNoValidLink => 'No valid link available';

  @override
  String get specialistSessionCouldNotOpenLink => 'Could not open link';

  @override
  String specialistSessionCalendarTileMeta(
    String time,
    int duration,
    String mode,
  ) {
    return '$time • $duration min • $mode';
  }

  @override
  String get communicationSignInToSendMessages => 'Sign in to send messages.';

  @override
  String get communicationNoSpecialistAssigned =>
      'No specialist is assigned to this child yet.';

  @override
  String get communicationMessageSpecialist => 'Message Specialist';

  @override
  String get communicationLoadingConversations => 'Loading conversations...';

  @override
  String get communicationNoConversations => 'No conversations yet.';

  @override
  String communicationStartedOn(String date) {
    return 'Started $date';
  }

  @override
  String get communicationOpeningConversation => 'Opening conversation...';

  @override
  String get communicationLoadingMessages => 'Loading messages...';

  @override
  String get communicationNoMessagesYet =>
      'No messages yet. Say hello to start the conversation.';

  @override
  String get communicationTypeMessageHint => 'Type a message...';

  @override
  String get communicationAttachHint => 'Attach a file, image, or audio';

  @override
  String get communicationEarlierMessages => 'Earlier';

  @override
  String get communicationFileLinkUnavailable => 'File link unavailable.';

  @override
  String get communicationInvalidFileLink => 'Invalid file link.';

  @override
  String get communicationFileLinkCopied => 'File link copied.';

  @override
  String get communicationUnsupportedVideoFormat => 'Unsupported video format.';

  @override
  String get communicationAttachmentTypeImage => 'Image';

  @override
  String get communicationAttachmentTypeAudio => 'Audio';

  @override
  String get communicationAttachmentTypeVideo => 'Video';

  @override
  String get communicationAttachmentTypeFile => 'File';

  @override
  String get communicationAttachmentPreviewUnavailable => 'Preview unavailable';

  @override
  String get communicationAudioLoading => 'Loading audio...';

  @override
  String get communicationAudioPlaybackError => 'Unable to play audio.';

  @override
  String commonLabelCopied(String label) {
    return '$label copied';
  }

  @override
  String get attachmentUnableToOpen => 'Unable to open this attachment.';

  @override
  String get parentReportNoLinkToCopy => 'No report link to copy.';

  @override
  String get parentReportNoFileAvailable => 'No report file available yet.';

  @override
  String get parentReportInvalidLink => 'Invalid report link.';

  @override
  String get parentReportLinkCopied => 'Report link copied to clipboard.';

  @override
  String get parentReportOpenFailedLinkCopied =>
      'Could not open report. Link copied to clipboard.';

  @override
  String get adminSessionsEditTitle => 'Edit Session';

  @override
  String adminSessionsPatientLabel(String name) {
    return 'Patient: $name';
  }

  @override
  String get adminSessionsDateField => 'Date (YYYY-MM-DD)';

  @override
  String get adminSessionsTimeField => 'Time (HH:MM)';

  @override
  String get adminSessionsLocationField => 'Location / Link';

  @override
  String get adminSessionsStatusField => 'Status';

  @override
  String get adminSessionsCancellationReasonField => 'Cancellation reason';

  @override
  String get adminSessionsStatusFinal =>
      'Status is final and cannot be changed.';

  @override
  String get adminSessionsInvalidDateTime => 'Invalid date or time.';

  @override
  String get adminSessionsUpdatedSuccess => 'Session updated successfully.';

  @override
  String adminSessionsActionFailed(String error) {
    return 'Action failed: $error';
  }

  @override
  String get adminPatientsUpdatedSuccess => 'Patient updated successfully.';

  @override
  String get adminPatientsNotFound => 'Patient not found.';

  @override
  String get adminPatientsNotSpecified => 'Not specified';

  @override
  String get adminPatientsSelectDateOfBirth => 'Select date of birth';

  @override
  String get adminPatientsAssignments => 'Patient Assignments';

  @override
  String get adminUsersUserDeactivated => 'User deactivated.';

  @override
  String get adminUsersUserActivated => 'User activated.';

  @override
  String get adminUsersAddUserTitle => 'Add User';

  @override
  String get adminUsersEditUserTitle => 'Edit User';

  @override
  String get adminUsersPasswordField => 'Password';

  @override
  String get adminUsersPhoneOptional => 'Phone (optional)';

  @override
  String get adminUsersRoleField => 'Role';

  @override
  String get adminUsersValidationRequired =>
      'Please complete all required fields.';

  @override
  String get adminUsersCreatedSuccess => 'User created successfully.';

  @override
  String get adminUsersUpdatedSuccess => 'User updated successfully.';

  @override
  String get adminMatchingChooseSpecialist => 'Choose Specialist';

  @override
  String get adminMatchingLoadingSpecialists =>
      'Loading matching specialists...';

  @override
  String get adminMatchingAssigning => 'Assigning...';

  @override
  String get adminMatchingNoSpecialists => 'No matching specialists found.';

  @override
  String get adminMatchingSelectSpecialist =>
      'Select a specialist to assign to this case.';

  @override
  String get adminMatchingConfirmBody =>
      'Assign this specialist to the case request?';

  @override
  String get adminMatchingAssignedSuccess =>
      'Specialist assigned successfully.';

  @override
  String get adminMatchingWaitForAssignment =>
      'Please wait while the assignment is processed.';

  @override
  String get specialistProfileUpdatedSuccess => 'Profile updated successfully.';

  @override
  String get specialistProfilePersonalSection => 'Personal';

  @override
  String get specialistProfileProfessionalSection => 'Professional';

  @override
  String get specialistReportNotFound => 'Report not found.';

  @override
  String get specialistReportDetailsTitle => 'Report Details';

  @override
  String get specialistReportAttachments => 'Attachments';

  @override
  String get specialistReportViewPdf => 'View PDF';

  @override
  String get specialistReportCopyPdfLink => 'Copy PDF Link';

  @override
  String get specialistReportPdfLinkCopied => 'PDF link copied to clipboard';

  @override
  String get specialistReportPdfGeneratedSuccess =>
      'PDF generated successfully';

  @override
  String get specialistReportGeneratingPdf => 'Generating PDF...';

  @override
  String get specialistReportGeneratePdf => 'Generate PDF';

  @override
  String get specialistAiRecommendationsTitle => 'AI Recommendations';

  @override
  String get specialistAiRecommendationGenerated =>
      'AI recommendation generated';

  @override
  String get specialistAiRecommendationAccepted => 'Recommendation accepted';

  @override
  String get specialistAiRecommendationRejected => 'Recommendation rejected';

  @override
  String get specialistAiGenerateFirstRecommendation =>
      'Generate your first AI recommendation';

  @override
  String get devDashboardPreviewsTitle => 'Dashboard Previews';
}
