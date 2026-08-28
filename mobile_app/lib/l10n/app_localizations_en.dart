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
  String get commonGenerate => 'Generate';

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
  String get navComplaints => 'Complaints';

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
  String get specialistDashboardWeeklyPatientInteractions =>
      'Weekly Patient Interactions';

  @override
  String get specialistDashboardWeeklyPatientInteractionsSubtitle =>
      'Unique patients you interacted with this week';

  @override
  String specialistDashboardUniquePatientsThisWeek(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count unique patients this week',
      one: '1 unique patient this week',
    );
    return '$_temp0';
  }

  @override
  String get specialistDashboardWeeklyInteractionsLoadFailed =>
      'Couldn\'t load weekly patient interactions. Please try again.';

  @override
  String get specialistDashboardNoInteractionsThisDay =>
      'No patient interactions on this day.';

  @override
  String specialistDashboardInteractionPatientsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count patients',
      one: '1 patient',
    );
    return '$_temp0';
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
  String get adminAiNoPatientsFlagged =>
      'No patients currently need attention.';

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
  String get specialistPatientDetailsDiagnosisSectionTitle =>
      'Diagnosis / Condition';

  @override
  String get specialistPatientDetailsCurrentDiagnosis => 'Current Diagnosis';

  @override
  String get specialistPatientDetailsDiagnosisHistory => 'Diagnosis History';

  @override
  String get specialistPatientDetailsManageDiagnosis => 'Manage Diagnosis';

  @override
  String get specialistPatientDetailsManageDiagnosisTitle => 'Manage Diagnosis';

  @override
  String get specialistPatientDetailsDiagnosisSelectorLabel =>
      'Diagnosis / Condition';

  @override
  String get specialistPatientDetailsSelectDiagnosis => 'Select diagnosis';

  @override
  String get specialistPatientDetailsDiagnosisOptionOther => 'Other';

  @override
  String get specialistPatientDetailsOtherDiagnosisLabel => 'Other Diagnosis';

  @override
  String get specialistPatientDetailsDiagnosisSelectRequired =>
      'Please select a diagnosis.';

  @override
  String get specialistPatientDetailsOtherDiagnosisRequired =>
      'Please enter the diagnosis.';

  @override
  String get specialistDiagnosisOptionSpeechDelay => 'Speech Delay';

  @override
  String get specialistDiagnosisOptionSpeechLanguageDelay =>
      'Speech and Language Delay';

  @override
  String get specialistDiagnosisOptionLanguageDelay => 'Language Delay';

  @override
  String get specialistDiagnosisOptionArticulationDisorder =>
      'Articulation Disorder';

  @override
  String get specialistDiagnosisOptionFluencyDisorder => 'Fluency Disorder';

  @override
  String get specialistDiagnosisOptionVoiceDisorder => 'Voice Disorder';

  @override
  String get specialistDiagnosisOptionAutismSpectrumDisorder =>
      'Autism Spectrum Disorder';

  @override
  String get specialistDiagnosisOptionDevelopmentalDelay =>
      'Developmental Delay';

  @override
  String get specialistDiagnosisOptionLearningDifficulty =>
      'Learning Difficulty';

  @override
  String get specialistDiagnosisOptionMotorDelay => 'Motor Delay';

  @override
  String get specialistDiagnosisOptionAdhd => 'ADHD';

  @override
  String get specialistPatientDetailsDiagnosisTitleLabel => 'Diagnosis Title';

  @override
  String get specialistPatientDetailsDiagnosisDescriptionLabel => 'Description';

  @override
  String get specialistPatientDetailsDiagnosedDateLabel => 'Diagnosed Date';

  @override
  String get specialistPatientDetailsDiagnosisTitleRequired =>
      'Diagnosis title is required';

  @override
  String get specialistPatientDetailsDiagnosisSaved => 'Diagnosis saved';

  @override
  String specialistPatientDetailsSaveDiagnosisFailed(String error) {
    return 'Failed to save diagnosis: $error';
  }

  @override
  String get specialistPatientDetailsSaveDiagnosisFailedGeneric =>
      'Failed to save diagnosis';

  @override
  String specialistPatientDetailsDiagnosedOn(String date) {
    return 'Diagnosed: $date';
  }

  @override
  String specialistPatientDetailsDiagnosedBy(String name) {
    return 'Diagnosed by: $name';
  }

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
  String get specialistExerciseExpectedTextField => 'Expected Text';

  @override
  String get specialistExerciseExpectedTextHelper =>
      'The exact phrase the patient should say. Used for word and phoneme alignment.';

  @override
  String get specialistExerciseExpectedTextRequired =>
      'Expected Text is required for Speech Articulation exercises.';

  @override
  String get specialistExerciseTargetSoundField => 'Target Sound';

  @override
  String get specialistExerciseTargetSoundHelper =>
      'Optional target speech sound for phoneme-level analysis, e.g. r.';

  @override
  String get specialistExerciseExpectedTextSection => 'Expected Text';

  @override
  String get specialistExerciseTargetSoundSection => 'Target Sound';

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
  String get specialistAssignedExerciseDeactivateAssignment =>
      'Deactivate Assignment';

  @override
  String get specialistAssignedExerciseDeactivateTitle =>
      'Deactivate Assignment';

  @override
  String get specialistAssignedExerciseDeactivateBody =>
      'This exercise will no longer be active for the patient. Previous submissions, reviews, and related history will be preserved. The exercise will remain in the library.';

  @override
  String get specialistAssignedExerciseDeactivateConfirm =>
      'Deactivate Assignment';

  @override
  String get specialistAssignedExerciseDeactivateSuccess =>
      'Assignment deactivated.';

  @override
  String get specialistAssignedExerciseDeactivateFailed =>
      'Failed to deactivate assigned exercise.';

  @override
  String get specialistAssignedExerciseAlreadyInactive =>
      'This assignment is already inactive.';

  @override
  String get specialistAssignedExerciseDeactivating => 'Deactivating...';

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
  String get specialistSpeechAnalysisWordCorrect => 'Correct';

  @override
  String get specialistSpeechAnalysisAsrMismatches => 'ASR Mismatches';

  @override
  String get specialistSpeechAnalysisWordOmissions => 'Omissions';

  @override
  String get specialistSpeechAnalysisWordInsertions => 'Insertions';

  @override
  String get specialistSpeechAnalysisRepeatedAsrMismatches =>
      'Repeated ASR Mismatches';

  @override
  String specialistSpeechAnalysisAsrMismatchDetectedCount(int count) {
    return 'Detected $count times';
  }

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
  String specialistSpeechAnalysisHistoryWordAccuracy(String accuracy) {
    return 'Word Accuracy: $accuracy%';
  }

  @override
  String get specialistSpeechAnalysisHistoryFallback => 'Speech analysis';

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
  String get communicationListAttachment => 'Attachment';

  @override
  String get communicationPreviewSentImage => 'Sent an image';

  @override
  String get communicationPreviewSentAudio => 'Sent an audio recording';

  @override
  String get communicationPreviewSentPdf => 'Sent a PDF file';

  @override
  String get communicationPreviewSentVideo => 'Sent a video';

  @override
  String get communicationPreviewSentFile => 'Sent a file';

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
  String get communicationSeen => 'Seen';

  @override
  String get notificationsPermissionTitle => 'Enable notifications';

  @override
  String get notificationsPermissionBody =>
      'Stay up to date on sessions, exercises, messages, feedback, reports, and other account activity.';

  @override
  String get notificationsPermissionEnable => 'Enable notifications';

  @override
  String get notificationsPermissionMaybeLater => 'Maybe later';

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
  String get specialistReportStatusPdfReady => 'PDF Ready';

  @override
  String get specialistReportStatusAwaitingReview => 'Awaiting Review';

  @override
  String get specialistReportReviewBanner =>
      'This AI report is awaiting specialist review. Approve it to generate a PDF, or discard the draft.';

  @override
  String get specialistReportApproveAndGeneratePdf => 'Approve & Generate PDF';

  @override
  String get specialistReportApprovingPdf => 'Approving & generating PDF...';

  @override
  String get specialistReportApprovedSuccess =>
      'Report approved and PDF generated successfully.';

  @override
  String get specialistReportDiscard => 'Discard Report';

  @override
  String get specialistReportDiscardConfirmTitle => 'Discard AI report?';

  @override
  String get specialistReportDiscardConfirmBody =>
      'This will permanently remove the AI-generated draft. This action cannot be undone.';

  @override
  String get specialistReportDiscardConfirmAction => 'Discard';

  @override
  String get specialistReportDiscarding => 'Discarding...';

  @override
  String get specialistReportDiscardSuccess => 'AI report discarded.';

  @override
  String get specialistReportDiscardFailed => 'Failed to discard AI report.';

  @override
  String get specialistReportEditReport => 'Edit Report';

  @override
  String get specialistReportEditingBanner => 'Editing Report';

  @override
  String get specialistReportSaveChanges => 'Save Changes';

  @override
  String get specialistReportSavingChanges => 'Saving changes...';

  @override
  String get specialistReportCancelEditing => 'Cancel Editing';

  @override
  String get specialistReportSaveChangesSuccess => 'Changes saved successfully';

  @override
  String get specialistReportSaveChangesFailed => 'Failed to save changes';

  @override
  String get specialistReportEditEmptyContent =>
      'Report content cannot be empty.';

  @override
  String get specialistReportEditListHint => 'Enter one item per line.';

  @override
  String get specialistAiReportSectionExecutiveSummary => 'Executive Summary';

  @override
  String get specialistAiReportSectionPatientProgress =>
      'Patient Progress Summary';

  @override
  String get specialistAiReportSectionSpeechAnalysis =>
      'Speech Analysis Summary';

  @override
  String get specialistAiReportSectionExerciseAdherence =>
      'Exercise Adherence Summary';

  @override
  String get specialistAiReportSectionGoalProgress => 'Goal Progress Summary';

  @override
  String get specialistAiReportSectionClinicalInsights => 'Clinical Insights';

  @override
  String get specialistAiReportSectionRisks => 'Risks or Regressions';

  @override
  String get specialistAiReportSectionRecommendations => 'Recommendations';

  @override
  String get specialistAiReportSectionNextSteps => 'Next Steps';

  @override
  String get specialistGenerateAiReportSuccessReview =>
      'AI report generated. Please review it before creating a PDF.';

  @override
  String get specialistGenerateAiReport => 'Generate AI Report';

  @override
  String get specialistGenerateAiReportSubtitle =>
      'Create a weekly or monthly AI report from the patient\'s clinical progress data.';

  @override
  String get specialistAiReportTypeLabel => 'Report Type';

  @override
  String get specialistAiReportPeriodLabel => 'Report Period';

  @override
  String get specialistAiReportPeriodFrom => 'From';

  @override
  String get specialistAiReportPeriodTo => 'To';

  @override
  String get specialistGenerateAiReportSubmit => 'Generate Report';

  @override
  String get specialistGenerateAiReportGenerating => 'Generating...';

  @override
  String get specialistGenerateAiReportSuccess =>
      'AI report generated successfully.';

  @override
  String get specialistAiReportPatientRequired => 'Patient is required.';

  @override
  String get specialistAiReportTypeRequired =>
      'Report type must be weekly or monthly.';

  @override
  String get specialistAiReportStartRequired => 'Start date is required.';

  @override
  String get specialistAiReportEndRequired => 'End date is required.';

  @override
  String get specialistAiReportStartAfterEnd =>
      'period_start cannot be after period_end';

  @override
  String get specialistAiReportPeriodNotEnded =>
      'Cannot generate report for a period that has not ended yet';

  @override
  String get specialistCreateReport => 'Create Report';

  @override
  String get specialistCreateReportSubtitle =>
      'Create a clinical report for one of your assigned patients.';

  @override
  String get specialistCreateReportTitleLabel => 'Title';

  @override
  String get specialistCreateReportSummaryLabel => 'Summary';

  @override
  String get specialistCreateReportCreating => 'Creating...';

  @override
  String get specialistCreateReportSuccess => 'Report created successfully.';

  @override
  String get specialistRegularReportTypeRequired =>
      'report_type must be weekly, monthly, assessment, or progress';

  @override
  String get specialistCreateReportTitleMaxLength =>
      'title must be 200 characters or fewer';

  @override
  String get specialistAiRecommendationsTitle => 'AI Recommendations';

  @override
  String get specialistAiRecommendationGenerated =>
      'AI recommendation generated';

  @override
  String get specialistAiRecommendationAccepted => 'Recommendation accepted';

  @override
  String get specialistAiRecommendationAssign => 'Assign';

  @override
  String get specialistAiRecommendationAssigning => 'Assigning...';

  @override
  String get specialistAiRecommendationRejected => 'Recommendation rejected';

  @override
  String get specialistAiGenerateFirstRecommendation =>
      'Generate your first AI recommendation';

  @override
  String get devDashboardPreviewsTitle => 'Dashboard Previews';

  @override
  String get parentCaseRequestsListDisclaimer =>
      'These are preliminary requests, not official diagnoses. The admin team reviews each request and assigns a suitable specialist.';

  @override
  String get parentCaseRequestsEmptyTitle => 'No case requests yet.';

  @override
  String get parentCaseRequestsEmptyMessage =>
      'Submit a request so the admin team can review the case and assign a suitable specialist.';

  @override
  String get parentCaseRequestsDateUnavailable => 'Date unavailable';

  @override
  String get parentCaseRequestsSignInRequired =>
      'Please sign in to view case requests.';

  @override
  String parentCaseRequestsLoadFailed(String error) {
    return 'Failed to load case requests: $error';
  }

  @override
  String parentCaseRequestsRefreshFailed(String error) {
    return 'Failed to refresh case requests: $error';
  }

  @override
  String get parentCaseRequestFormNewTitle => 'New Case Request';

  @override
  String get parentCaseRequestFormEditTitle => 'Edit Case Request';

  @override
  String get parentCaseRequestFormDiscardTitle => 'Discard changes?';

  @override
  String get parentCaseRequestFormDiscardMessage =>
      'You have unsaved changes. Leave this form without saving?';

  @override
  String get parentCaseRequestFormStay => 'Stay';

  @override
  String get parentCaseRequestFormLeave => 'Leave';

  @override
  String get parentCaseRequestFormLoadFailed =>
      'Failed to load request for editing.';

  @override
  String get parentCaseRequestFormOnlyPendingEditable =>
      'Only pending requests can be edited.';

  @override
  String get parentCaseRequestFormUpdatedSuccess =>
      'Case request updated successfully.';

  @override
  String get parentCaseRequestFormSubmittedSuccess =>
      'Case request submitted successfully.';

  @override
  String parentCaseRequestFormImageSelectFailed(String error) {
    return 'Unable to select image: $error';
  }

  @override
  String get parentCaseRequestFormSubmitRequest => 'Submit Case Request';

  @override
  String get parentCaseRequestFormSubmitting => 'Submitting...';

  @override
  String get parentCaseRequestFormChildInfoSection => 'Child Information';

  @override
  String get parentCaseRequestFormChangeChildPhoto => 'Change child photo';

  @override
  String get parentCaseRequestFormAddChildPhoto => 'Add child photo';

  @override
  String get parentCaseRequestFormRemovePhoto => 'Remove photo';

  @override
  String get parentCaseRequestFormChildName => 'Child name';

  @override
  String get parentCaseRequestFormCategoryGuidance =>
      'Choose the category closest to the observed difficulty. The specialist will confirm the case after assessment.';

  @override
  String get parentCaseRequestFormCaseDescriptionSection => 'Case Description';

  @override
  String get parentCaseRequestFormCaseDescriptionLabel => 'Case description';

  @override
  String parentCaseRequestFormCaseDescriptionHelper(int max) {
    return 'Required. Up to $max characters.';
  }

  @override
  String get parentCaseRequestFormObservedDifficultiesLabel =>
      'Observed difficulties';

  @override
  String parentCaseRequestFormObservedDifficultiesHelper(int max) {
    return 'Optional. Up to $max characters.';
  }

  @override
  String get parentCaseRequestFormHasPreviousDiagnosis =>
      'Has previous diagnosis?';

  @override
  String get parentCaseRequestFormPreviousDiagnosisDetails =>
      'Previous diagnosis details';

  @override
  String get parentCaseRequestFormCurrentlyReceivingTreatment =>
      'Currently receiving treatment?';

  @override
  String get parentCaseRequestFormCurrentTreatmentDetails =>
      'Current treatment details';

  @override
  String get parentCaseRequestFormHistoryHelper =>
      'Provide as much detail as you can to help the specialist prepare.';

  @override
  String get parentCaseRequestFormPreferredContactPeriod =>
      'Preferred Contact Period';

  @override
  String get parentCaseRequestFormReviewTitle => 'Review and Submit';

  @override
  String get parentCaseRequestFormReviewChildName => 'Child name';

  @override
  String get parentCaseRequestFormReviewDob => 'Date of birth';

  @override
  String get parentCaseRequestFormReviewGender => 'Gender';

  @override
  String get parentCaseRequestFormReviewCategory => 'Category';

  @override
  String get parentCaseRequestFormReviewCaseDescription => 'Case description';

  @override
  String get parentCaseRequestFormReviewObservedDifficulties =>
      'Observed difficulties';

  @override
  String get parentCaseRequestFormReviewPreviousDiagnosis =>
      'Previous diagnosis';

  @override
  String get parentCaseRequestFormReviewCurrentTreatment => 'Current treatment';

  @override
  String get parentCaseRequestFormReviewPreferredContact => 'Preferred contact';

  @override
  String get parentCaseRequestFormNotSelected => 'Not selected';

  @override
  String get parentCaseRequestFormNotSet => 'Not set';

  @override
  String get parentCaseRequestFormNotSpecified => 'Not specified';

  @override
  String get parentCaseRequestFormNoneProvided => 'None provided';

  @override
  String get parentCaseRequestFormStepChild => 'Child';

  @override
  String get parentCaseRequestFormStepCategory => 'Category';

  @override
  String get parentCaseRequestFormStepDescription => 'Description';

  @override
  String get parentCaseRequestFormStepHistory => 'History';

  @override
  String get parentCaseRequestFormStepContact => 'Contact';

  @override
  String get parentCaseRequestFormStepReview => 'Review';

  @override
  String parentCaseRequestFormStepProgress(
    int current,
    int total,
    String stepName,
  ) {
    return 'Step $current of $total: $stepName';
  }

  @override
  String get parentCaseRequestFormValidationChildNameRequired =>
      'Child name is required.';

  @override
  String parentCaseRequestFormValidationChildNameMax(int max) {
    return 'Child name must not exceed $max characters.';
  }

  @override
  String get parentCaseRequestFormValidationDobRequired =>
      'Date of birth is required.';

  @override
  String get parentCaseRequestFormValidationDobFuture =>
      'Date of birth cannot be in the future.';

  @override
  String get parentCaseRequestFormValidationGenderRequired =>
      'Gender is required.';

  @override
  String get parentCaseRequestFormValidationCategoryRequired =>
      'Please select a case category.';

  @override
  String get parentCaseRequestFormValidationDescriptionRequired =>
      'Case description is required.';

  @override
  String parentCaseRequestFormValidationDescriptionMax(int max) {
    return 'Case description must not exceed $max characters.';
  }

  @override
  String parentCaseRequestFormValidationObservedMax(int max) {
    return 'Observed difficulties must not exceed $max characters.';
  }

  @override
  String parentCaseRequestFormValidationPreviousDiagnosisMax(int max) {
    return 'Previous diagnosis details must not exceed $max characters.';
  }

  @override
  String parentCaseRequestFormValidationCurrentTreatmentMax(int max) {
    return 'Current treatment details must not exceed $max characters.';
  }

  @override
  String get parentCaseRequestFormValidationContactPeriodRequired =>
      'Please choose a preferred contact period.';

  @override
  String parentCaseRequestFormCategoriesLoadFailed(String error) {
    return 'Failed to load categories: $error';
  }

  @override
  String parentCaseRequestFormCategoriesRefreshFailed(String error) {
    return 'Failed to refresh categories: $error';
  }

  @override
  String get parentCaseRequestDetailsTitle => 'Request Details';

  @override
  String get parentCaseRequestDetailsEditTooltip => 'Edit request';

  @override
  String get parentCaseRequestDetailsNotFound => 'Case request not found.';

  @override
  String get parentCaseRequestDetailsUnavailable => 'Unavailable';

  @override
  String get parentCaseRequestDetailsProgressTitle => 'Request Progress';

  @override
  String get parentCaseRequestDetailsProgressStepSubmitted => 'Submitted';

  @override
  String get parentCaseRequestDetailsProgressStepAdminReview => 'Admin Review';

  @override
  String get parentCaseRequestDetailsProgressStepSpecialistAssigned =>
      'Specialist Assigned';

  @override
  String get parentCaseRequestDetailsProgressStepAssessment => 'Assessment';

  @override
  String get parentCaseRequestDetailsProgressStepAccepted => 'Accepted';

  @override
  String get parentCaseRequestDetailsProgressStepPatientProfileCreated =>
      'Patient Profile Created';

  @override
  String get parentCaseRequestDetailsNotAcceptedTitle => 'Request Not Accepted';

  @override
  String get parentCaseRequestDetailsChildProfileActiveTitle =>
      'Child Profile Active';

  @override
  String get parentCaseRequestDetailsChildProfileActiveMessage =>
      'The child profile is now active and ready for follow-up.';

  @override
  String get parentCaseRequestDetailsOpenChildProfile => 'Open Child Profile';

  @override
  String get parentCaseRequestDetailsChildInformation => 'Child Information';

  @override
  String get parentCaseRequestDetailsCaseDescription => 'Case description';

  @override
  String get parentCaseRequestDetailsObservedDifficulties =>
      'Observed difficulties';

  @override
  String get parentCaseRequestDetailsPreviousDiagnosis => 'Previous diagnosis';

  @override
  String get parentCaseRequestDetailsCurrentTreatment => 'Current treatment';

  @override
  String get parentCaseRequestDetailsPreferredContactPeriod =>
      'Preferred contact period';

  @override
  String get parentCaseRequestDetailsAssignedSpecialist =>
      'Assigned Specialist';

  @override
  String get parentCaseRequestDetailsAttachments => 'Attachments';

  @override
  String get parentCaseRequestDetailsAttachmentsHint =>
      'Supported: image, audio, video, PDF';

  @override
  String get parentCaseRequestDetailsNoAttachments => 'No attachments yet.';

  @override
  String get parentCaseRequestDetailsAddAttachment => 'Add Attachment';

  @override
  String get parentCaseRequestDetailsAttachmentUploaded =>
      'Attachment uploaded successfully';

  @override
  String get parentCaseRequestDetailsAttachmentDeleted => 'Attachment deleted';

  @override
  String get parentCaseRequestDetailsDeleteAttachmentTitle =>
      'Delete attachment?';

  @override
  String parentCaseRequestDetailsDeleteAttachmentMessage(String name) {
    return 'Remove \"$name\" from this request?';
  }

  @override
  String parentCaseRequestDetailsLoadFailed(String error) {
    return 'Failed to load case request: $error';
  }

  @override
  String parentCaseRequestDetailsRefreshFailed(String error) {
    return 'Failed to refresh case request: $error';
  }

  @override
  String parentCaseRequestDetailsSubmitFailed(String error) {
    return 'Failed to submit case request: $error';
  }

  @override
  String parentCaseRequestDetailsUpdateFailed(String error) {
    return 'Failed to update case request: $error';
  }

  @override
  String parentCaseRequestDetailsUploadChildImageFailed(String error) {
    return 'Failed to upload child image: $error';
  }

  @override
  String parentCaseRequestDetailsUploadAttachmentFailed(String error) {
    return 'Failed to upload attachment: $error';
  }

  @override
  String parentCaseRequestDetailsDeleteAttachmentFailed(String error) {
    return 'Failed to delete attachment: $error';
  }

  @override
  String get caseIntakeStatusPending => 'Pending Review';

  @override
  String get caseIntakeStatusAssigned => 'Specialist Assigned';

  @override
  String get caseIntakeStatusUnderAssessment => 'Under Assessment';

  @override
  String get caseIntakeStatusAccepted => 'Accepted';

  @override
  String get caseIntakeStatusRejected => 'Rejected';

  @override
  String get caseIntakeStatusConvertedToPatient => 'Profile Created';

  @override
  String get caseIntakeStatusPendingSubtitle =>
      'Your request is waiting for admin review.';

  @override
  String get caseIntakeStatusAssignedSubtitle =>
      'A specialist has been assigned and will begin reviewing the case.';

  @override
  String get caseIntakeStatusUnderAssessmentSubtitle =>
      'The assigned specialist is assessing the case.';

  @override
  String get caseIntakeStatusAcceptedSubtitle =>
      'The case was accepted. Patient profile creation is in progress.';

  @override
  String get caseIntakeStatusRejectedSubtitle =>
      'This request was not accepted. See the reason below.';

  @override
  String get caseIntakeStatusConvertedToPatientSubtitle =>
      'The case was accepted and the patient profile was created.';

  @override
  String get caseIntakeAttachmentPdf => 'PDF';

  @override
  String get specialistCaseRequestsDescription =>
      'Review assigned cases and track their assessment status.';

  @override
  String get specialistCaseRequestsLoading =>
      'Loading assigned case requests...';

  @override
  String get specialistCaseRequestsEmpty =>
      'No assigned case requests yet.\nAssigned cases will appear here after an admin selects you for a request.';

  @override
  String specialistCaseRequestsLoadFailed(String error) {
    return 'Failed to load assigned case requests: $error';
  }

  @override
  String specialistCaseRequestsAssignedOn(String date) {
    return 'Assigned $date';
  }

  @override
  String get specialistCaseRequestsUnnamedChild => 'Unnamed child';

  @override
  String get specialistCaseRequestsOneAttachment => '1 attachment';

  @override
  String specialistCaseRequestsAttachmentCount(int count) {
    return '$count attachments';
  }

  @override
  String get specialistCaseRequestsConversationAvailable =>
      'Conversation available';

  @override
  String get specialistCaseRequestDetailsTitle => 'Case Request';

  @override
  String get specialistCaseRequestDetailsReviewIntro =>
      'Review the submitted information before starting the assessment.';

  @override
  String get specialistCaseRequestDetailsLoading => 'Loading case request...';

  @override
  String specialistCaseRequestDetailsParentLabel(String name) {
    return 'Parent: $name';
  }

  @override
  String get specialistCaseRequestDetailsStatusTimeline => 'Status Timeline';

  @override
  String get specialistCaseRequestDetailsTimelineAssigned => 'Assigned';

  @override
  String get specialistCaseRequestDetailsTimelineUnderAssessment =>
      'Under Assessment';

  @override
  String get specialistCaseRequestDetailsTimelineAccepted => 'Accepted';

  @override
  String get specialistCaseRequestDetailsTimelineConverted => 'Converted';

  @override
  String get specialistCaseRequestDetailsTimelineInProgress => 'In progress';

  @override
  String get specialistCaseRequestDetailsRejectionReason => 'Rejection Reason';

  @override
  String get specialistCaseRequestDetailsPatientProfileCreated =>
      'Patient profile created successfully.';

  @override
  String get specialistCaseRequestDetailsOpenPatientProfile =>
      'Open Patient Profile';

  @override
  String get specialistCaseRequestDetailsCaseInformation => 'Case Information';

  @override
  String get specialistCaseRequestDetailsPreviousDiagnosisTreatment =>
      'Previous Diagnosis & Treatment';

  @override
  String get specialistCaseRequestDetailsDiagnosisDetails =>
      'Diagnosis details';

  @override
  String get specialistCaseRequestDetailsTreatmentDetails =>
      'Treatment details';

  @override
  String get specialistCaseRequestDetailsCurrentlyReceivingTreatment =>
      'Currently receiving treatment';

  @override
  String get specialistCaseRequestDetailsParentInformation =>
      'Parent Information';

  @override
  String get specialistCaseRequestDetailsAge => 'Age';

  @override
  String get specialistCaseRequestDetailsAgeUnavailable => 'Unavailable';

  @override
  String get specialistCaseRequestDetailsAgeUnderOneMonth => 'Under 1 month';

  @override
  String get specialistCaseRequestDetailsAgeOneMonth => '1 month';

  @override
  String specialistCaseRequestDetailsAgeMonths(int count) {
    return '$count months';
  }

  @override
  String get specialistCaseRequestDetailsAgeOneYear => '1 year';

  @override
  String specialistCaseRequestDetailsAgeYears(int count) {
    return '$count years';
  }

  @override
  String get specialistCaseRequestDetailsNoAttachments => 'No attachments';

  @override
  String specialistCaseRequestDetailsCopyLabel(String label) {
    return 'Copy $label';
  }

  @override
  String get specialistCaseAssessmentStartTitle => 'Start Assessment';

  @override
  String get specialistCaseAssessmentStartMessage =>
      'Contact the parent first if you have not already. Start the preliminary assessment for this case?';

  @override
  String get specialistCaseAssessmentStartAction => 'Start Assessment';

  @override
  String get specialistCaseAssessmentStartedSuccess =>
      'Assessment started successfully';

  @override
  String get specialistCaseAssessmentNotesTitle =>
      'Preliminary Assessment Notes';

  @override
  String get specialistCaseAssessmentNotesHint =>
      'Enter preliminary assessment notes';

  @override
  String get specialistCaseAssessmentNotesRequired =>
      'Assessment notes are required.';

  @override
  String specialistCaseAssessmentNotesMaxLength(int max) {
    return 'Assessment notes must not exceed $max characters.';
  }

  @override
  String get specialistCaseAssessmentNotesUpdatedSuccess =>
      'Assessment notes updated successfully';

  @override
  String get specialistCaseAssessmentSaveNotes => 'Save Notes';

  @override
  String get specialistCaseAssessmentAcceptTitle => 'Accept Case';

  @override
  String get specialistCaseAssessmentAcceptMessage =>
      'Accept this case for continued rehabilitation follow-up?\n\nThe patient profile will not be created yet.';

  @override
  String get specialistCaseAssessmentAcceptAction => 'Accept Case';

  @override
  String get specialistCaseAssessmentAcceptNotesRequired =>
      'Save assessment notes before accepting this case.';

  @override
  String get specialistCaseAssessmentAcceptSaveNotesFirst =>
      'Save your assessment notes before accepting.';

  @override
  String get specialistCaseAssessmentPatientProfileCreatedSuccess =>
      'Patient profile created successfully.';

  @override
  String get specialistCaseAssessmentCreatingPatientProfile =>
      'Creating patient profile...';

  @override
  String get specialistCaseAssessmentRejectTitle => 'Reject Case';

  @override
  String get specialistCaseAssessmentRejectAction => 'Reject Case';

  @override
  String get specialistCaseAssessmentRejectReasonLabel =>
      'Reason for rejection';

  @override
  String get specialistCaseAssessmentRejectReasonHelper =>
      'This reason will be visible to the parent.';

  @override
  String get specialistCaseAssessmentRejectReasonRequired =>
      'Reason for rejection is required.';

  @override
  String specialistCaseAssessmentRejectReasonMinLength(int min) {
    return 'Reason must be at least $min characters.';
  }

  @override
  String specialistCaseAssessmentRejectReasonMaxLength(int max) {
    return 'Reason must not exceed $max characters.';
  }

  @override
  String get specialistCaseAssessmentRejectedSuccess =>
      'Case request rejected successfully';

  @override
  String get specialistCaseAssessmentRejecting => 'Rejecting...';

  @override
  String get specialistCaseAssessmentStarting => 'Starting...';

  @override
  String get specialistCaseAssessmentWaitSavingNotes =>
      'Please wait while assessment notes are being saved.';

  @override
  String get specialistCaseAssessmentWaitCreatingProfile =>
      'Please wait while the patient profile is being created.';

  @override
  String get specialistCaseAssessmentWaitRejecting =>
      'Please wait while the case is being rejected.';

  @override
  String get specialistCaseAssessmentWaitStarting =>
      'Please wait while the assessment is starting.';

  @override
  String get specialistCaseAssessmentOnlyAssignedCanStart =>
      'Only assigned case requests can start assessment';

  @override
  String get specialistCaseAssessmentOnlyUnderAssessmentCanAccept =>
      'Only case requests under assessment can be accepted';

  @override
  String get specialistCaseAssessmentOnlyAssignedOrUnderAssessmentCanReject =>
      'Only assigned or under-assessment requests can be rejected';

  @override
  String get specialistCaseAssessmentCannotRejectAnymore =>
      'This case request can no longer be rejected';

  @override
  String get specialistCaseAssessmentStartFailed =>
      'Failed to start assessment. Please try again.';

  @override
  String get specialistCaseAssessmentSaveNotesFailed =>
      'Failed to update assessment notes. Please try again.';

  @override
  String get specialistCaseAssessmentAcceptFailed =>
      'Failed to accept case request. Please try again.';

  @override
  String get specialistCaseAssessmentRejectFailed =>
      'Failed to reject case request. Please try again.';

  @override
  String adminCaseAssignmentLoadFailed(String error) {
    return 'Failed to load matching specialists: $error';
  }

  @override
  String get adminCaseAssignmentInProgress => 'Assignment already in progress.';

  @override
  String get adminCaseAssignmentSelectSpecialist =>
      'Select a specialist to continue.';

  @override
  String get adminCaseAssignmentFailed =>
      'Failed to assign specialist. Please try again.';

  @override
  String get adminCaseAssignmentOnlyPending =>
      'Only pending case requests can be assigned';

  @override
  String get adminCaseAssignmentNotifySpecialist =>
      'The selected specialist will be notified after assignment.';

  @override
  String get adminCaseAssignmentNoActiveSpecialists =>
      'There are currently no active specialists linked to this category.';

  @override
  String adminCaseRequestDetailsSubmittedBy(String name) {
    return 'Submitted by $name';
  }

  @override
  String adminCaseRequestDetailsRequestId(String id) {
    return 'ID: $id';
  }

  @override
  String get adminCaseRequestDetailsRejectedTitle => 'Request rejected';

  @override
  String adminCaseRequestDetailsPatientId(String id) {
    return 'Patient ID: $id';
  }

  @override
  String get adminCaseRequestDetailsAssessmentNotesTitle =>
      'Internal Preliminary Assessment Notes';

  @override
  String get adminCaseRequestDetailsAssessmentNotesHint =>
      'Visible to admin only';

  @override
  String get adminCaseRequestDetailsConversationCreated =>
      'Conversation created';

  @override
  String adminCaseRequestDetailsConversationId(String id) {
    return 'Conversation ID: $id';
  }

  @override
  String get adminCaseRequestDetailsNoSpecialistPending =>
      'No specialist assigned yet.';

  @override
  String get adminCaseRequestDetailsNoSpecialist => 'No specialist assigned.';

  @override
  String get adminMatchingSpecialistsYearsUnknown => '— Years';

  @override
  String get adminMatchingSpecialistsOneYear => '1 Year';

  @override
  String adminMatchingSpecialistsYears(int count) {
    return '$count Years';
  }

  @override
  String get adminMatchingSpecialistsOneActivePatient => '1 Active Patient';

  @override
  String adminMatchingSpecialistsActivePatients(int count) {
    return '$count Active Patients';
  }

  @override
  String get adminMatchingSpecialistsOneCurrentRequest => '1 Current Request';

  @override
  String adminMatchingSpecialistsCurrentRequests(int count) {
    return '$count Current Requests';
  }

  @override
  String adminMatchingSpecialistsLicense(String number) {
    return 'License: $number';
  }

  @override
  String get parentSessionsTabUpcoming => 'Upcoming';

  @override
  String get parentSessionsTabPast => 'Past';

  @override
  String get parentSessionsSummaryStayOnTrack => 'Stay on track!';

  @override
  String get parentSessionsSummaryNoUpcoming => 'No upcoming sessions';

  @override
  String get parentSessionsSummaryOneUpcoming => 'You have 1 upcoming session.';

  @override
  String parentSessionsSummaryUpcomingCount(int count) {
    return 'You have $count upcoming sessions.';
  }

  @override
  String get parentSessionsSummaryPastAvailable =>
      'Past sessions are still available below.';

  @override
  String get parentSessionsSectionUpcoming => 'Upcoming Session';

  @override
  String get parentSessionsSectionPast => 'Past Sessions';

  @override
  String get parentSessionsEmptyUpcomingTitle => 'No upcoming sessions';

  @override
  String get parentSessionsEmptyUpcomingMessage =>
      'You do not have any scheduled sessions right now.';

  @override
  String get parentSessionsEmptyPastTitle => 'No past sessions yet';

  @override
  String get parentSessionsEmptyPastMessage =>
      'Completed sessions will appear here.';

  @override
  String get parentSessionsRequestCardTitle => 'Need to schedule a session?';

  @override
  String get parentSessionsRequestCardMessage =>
      'Request a new session with your specialist at a time that suits you.';

  @override
  String get parentSessionsRequestNewSession => 'Request New Session';

  @override
  String get parentSessionsDetailsTitle => 'Session Details';

  @override
  String get parentSessionsOnlineSession => 'Online session';

  @override
  String get parentSessionsCopyMeetingLink => 'Copy Meeting Link';

  @override
  String get parentSessionsOpenMeetingLink => 'Open Meeting Link';

  @override
  String get parentSessionsLinkCopied => 'Session link copied';

  @override
  String get parentSessionsNoLinkAvailable => 'No session link available';

  @override
  String get parentSessionsNoValidLink => 'No valid session link available';

  @override
  String get parentSessionsLocationPending => 'Location pending';

  @override
  String get parentSessionsOnlineGoogleMeet => 'Online • Google Meet';

  @override
  String get parentSessionsOnlineVideoSession => 'Online • Video Session';

  @override
  String get parentSessionsSignInRequired => 'Please sign in to view sessions.';

  @override
  String parentSessionsLoadFailed(String error) {
    return 'Failed to load sessions: $error';
  }

  @override
  String get parentSessionsMyRequests => 'My Session Requests';

  @override
  String get parentSessionsNoRequestsTitle => 'No session requests yet.';

  @override
  String get parentSessionsNoRequestsMessage =>
      'Use Request New Session above when you need an appointment.';

  @override
  String parentSessionsRequestedOn(String date) {
    return 'Requested $date';
  }

  @override
  String parentSessionsScheduledAt(String date, String time) {
    return 'Scheduled: $date at $time';
  }

  @override
  String get parentSessionRequestTitle => 'Request New Session';

  @override
  String get parentSessionRequestIntro =>
      'Submit a session request for your specialist to review.';

  @override
  String parentSessionRequestLoadChildrenFailed(String error) {
    return 'Failed to load children: $error';
  }

  @override
  String get parentSessionRequestNoChildren =>
      'No linked children found. Please contact your clinic administrator.';

  @override
  String get parentSessionRequestChild => 'Child';

  @override
  String get parentSessionRequestSpecialist => 'Specialist';

  @override
  String get parentSessionRequestReason => 'Reason';

  @override
  String get parentSessionRequestOtherReason => 'Other Reason';

  @override
  String get parentSessionRequestPreferredDate => 'Preferred Date';

  @override
  String get parentSessionRequestSelectDate => 'Select date';

  @override
  String get parentSessionRequestPreferredTime => 'Preferred Time';

  @override
  String get parentSessionRequestNotesOptional => 'Notes (optional)';

  @override
  String get parentSessionRequestSending => 'Sending...';

  @override
  String get parentSessionRequestSendRequest => 'Send Request';

  @override
  String parentSessionRequestSelectHint(String label) {
    return 'Select $label';
  }

  @override
  String get parentSessionRequestNoSpecialistAssigned =>
      'No specialist is assigned to this child yet.';

  @override
  String get parentSessionRequestNoSpecialistForSubmit =>
      'No specialist is assigned to this child.';

  @override
  String get parentSessionRequestSubmittedSuccess =>
      'Session request submitted successfully.';

  @override
  String get parentSessionRequestSignInRequired =>
      'Please sign in to view session requests.';

  @override
  String parentSessionRequestLoadFailed(String error) {
    return 'Failed to load session requests: $error';
  }

  @override
  String parentSessionRequestSubmitFailed(String error) {
    return 'Failed to submit session request: $error';
  }

  @override
  String get parentSessionRequestSubmitInProgress =>
      'A submission is already in progress.';

  @override
  String get parentSessionRequestSelectChild => 'Please select a child.';

  @override
  String get parentSessionRequestSelectReason => 'Please select a reason.';

  @override
  String get parentSessionRequestEnterOtherReason =>
      'Please enter the other reason.';

  @override
  String get parentSessionRequestSelectPreferredDate =>
      'Please select a preferred date.';

  @override
  String get parentSessionRequestSelectPreferredTime =>
      'Please select a preferred time.';

  @override
  String get parentExerciseChildDetailsTitle => 'Child Details';

  @override
  String get parentExerciseChildNotFound => 'Child not found.';

  @override
  String parentExerciseChildDetailsLoadFailed(String error) {
    return 'Failed to load child details: $error';
  }

  @override
  String parentExerciseAgeLabel(int age) {
    return 'Age: $age';
  }

  @override
  String parentExerciseDateOfBirthLabel(String date) {
    return 'Date of birth: $date';
  }

  @override
  String parentExerciseGenderLabel(String gender) {
    return 'Gender: $gender';
  }

  @override
  String parentExerciseProgressLabel(int percent) {
    return 'Progress: $percent%';
  }

  @override
  String get parentExerciseAssignedExercisesTitle => 'Assigned Exercises';

  @override
  String get parentExerciseNoAssignedYet => 'No assigned exercises yet.';

  @override
  String get parentExerciseNoReportsYet => 'No reports yet.';

  @override
  String get parentExerciseNoSessionsScheduled => 'No sessions scheduled.';

  @override
  String parentExerciseSessionSummary(
    String specialist,
    String date,
    String status,
  ) {
    return '$specialist • $date • $status';
  }

  @override
  String parentExerciseForChild(String childName) {
    return 'For $childName';
  }

  @override
  String get parentExerciseInformation => 'Exercise information';

  @override
  String get parentExerciseInstructions => 'Instructions';

  @override
  String get parentExerciseInstructionsFallback =>
      'Follow the specialist instructions for this exercise.';

  @override
  String parentExerciseFrequencyLabel(String frequency) {
    return 'Frequency: $frequency';
  }

  @override
  String get parentExerciseAlreadySubmitted => 'Already submitted';

  @override
  String get parentExerciseAwaitingReview => 'Awaiting specialist review';

  @override
  String get parentExerciseReviewedStatus => 'This exercise has been reviewed.';

  @override
  String get parentExerciseRetryRequested =>
      'Your specialist requested another attempt.';

  @override
  String get parentExerciseRetry => 'Retry Exercise';

  @override
  String get parentExerciseYourSubmission => 'Your Submission';

  @override
  String get parentExerciseNotesForSpecialist =>
      'Notes for specialist (optional)';

  @override
  String get parentExerciseSubmitting => 'Submitting...';

  @override
  String get parentExerciseSubmit => 'Submit Exercise';

  @override
  String get parentExerciseSubmitSuccess => 'Exercise submitted successfully';

  @override
  String get parentExerciseSubmitFailed =>
      'Failed to submit exercise. Please try again.';

  @override
  String get parentExerciseUploadPermissionDenied =>
      'You do not have permission to upload this file.';

  @override
  String get parentExerciseUploadUnsupportedType =>
      'This file type is not supported.';

  @override
  String get parentExerciseUploadFileTooLarge =>
      'The selected file is too large.';

  @override
  String get parentExerciseUploadFailed =>
      'Failed to upload media. Please try again.';

  @override
  String get parentExerciseUploadSignInRequired =>
      'Please sign in to upload this file.';

  @override
  String get parentExerciseInstructionMedia => 'Instructional Media';

  @override
  String get parentFeedbackTitle => 'Specialist Feedback';

  @override
  String get parentFeedbackNoneYet => 'No specialist feedback available yet.';

  @override
  String parentFeedbackRating(int rating) {
    return 'Rating: $rating/5';
  }

  @override
  String get parentFeedbackPlanStatusActive => 'Active';

  @override
  String get parentFeedbackPlanStatusArchived => 'Archived';

  @override
  String parentFeedbackSpecialistLabel(String name) {
    return 'Specialist: $name';
  }

  @override
  String parentFeedbackPlanStart(String date) {
    return 'Start: $date';
  }

  @override
  String parentFeedbackPlanEnd(String date) {
    return 'End: $date';
  }

  @override
  String get parentFeedbackTreatmentCompleted => 'Treatment Completed';

  @override
  String get parentFeedbackPlanCompletedMessage =>
      'Your child\'s rehabilitation plan has been completed.';

  @override
  String get parentFeedbackExperiencePrompt =>
      'We\'d love to hear about your experience with your specialist.';

  @override
  String get parentFeedbackCommentOptional => 'Comment (optional)';

  @override
  String get parentFeedbackCommentHint =>
      'Share your experience with the specialist...';

  @override
  String get parentFeedbackSubmit => 'Submit Feedback';

  @override
  String get parentFeedbackThankYou => 'Thank You!';

  @override
  String get parentFeedbackThankYouMessage =>
      'Thank you for sharing your feedback.';

  @override
  String get parentFeedbackYouRated => 'You rated';

  @override
  String get parentFeedbackYourSpecialist => 'your specialist';

  @override
  String parentFeedbackRatingOutOfFive(int rating) {
    return '$rating / 5';
  }

  @override
  String get parentFeedbackImproveServices =>
      'Your opinion helps us improve our rehabilitation services\nand support more families.';

  @override
  String get parentFeedbackRecordedSuccess =>
      'Your feedback has been recorded successfully.';

  @override
  String get parentMediaAdd => 'Add media';

  @override
  String get parentMediaAddDescription =>
      'Optional photo, video, or audio for the specialist.';

  @override
  String get parentMediaChooseFromGallery => 'Choose from gallery / files';

  @override
  String get parentMediaRecordVideo => 'Record video';

  @override
  String get parentMediaRecordAudio => 'Record audio';

  @override
  String get parentMediaTakePhoto => 'Take photo';

  @override
  String get parentMediaPhoto => 'Photo';

  @override
  String get parentMediaPermissionRequired =>
      'Permission is required to add media.';

  @override
  String get parentMediaRecordingInProgress => 'Recording in progress...';

  @override
  String get parentMediaTapStartStop => 'Tap start, then stop when finished.';

  @override
  String get parentMediaRecordingAudio => 'Recording audio';

  @override
  String get parentMediaReadyToRecord => 'Ready to record';

  @override
  String get parentMediaStartRecording => 'Start Recording';

  @override
  String get parentMediaStopRecording => 'Stop Recording';

  @override
  String get parentMediaRecordFailed =>
      'Could not record audio. Please try again.';

  @override
  String parentMediaAttached(String type) {
    return '$type attached';
  }

  @override
  String get parentMediaRemoveTooltip => 'Remove media';

  @override
  String get adminAuditUnknownDate => 'Unknown date';

  @override
  String get adminAuditReferenceId => 'Reference ID';

  @override
  String get adminAuditSystemUser => 'System';

  @override
  String get adminAuditSystemEntity => 'System';

  @override
  String get adminAuditSystemUserInitials => 'SY';

  @override
  String get auditActionActivity => 'Activity';

  @override
  String get auditActionCreate => 'Create';

  @override
  String get auditActionUpdate => 'Update';

  @override
  String get auditActionComplete => 'Complete';

  @override
  String get auditActionDelete => 'Delete';

  @override
  String get auditActionAssign => 'Assign';

  @override
  String get auditActionLogin => 'Login';

  @override
  String get auditActionLogout => 'Logout';

  @override
  String get auditActionCancel => 'Cancel';

  @override
  String get auditActionActivate => 'Activate';

  @override
  String get auditActionDeactivate => 'Deactivate';

  @override
  String get auditActionUnassign => 'Unassign';

  @override
  String get auditActionApprove => 'Approve';

  @override
  String get auditActionReject => 'Reject';

  @override
  String get auditActionAccept => 'Accept';

  @override
  String get auditActionArchive => 'Archive';

  @override
  String get auditActionUpload => 'Upload';

  @override
  String get auditActionGenerate => 'Generate';

  @override
  String get auditActionReview => 'Review';

  @override
  String get auditActionMarkRead => 'Mark read';

  @override
  String get auditActionReadAll => 'Read all';

  @override
  String get auditActionSessionComplete => 'Session Completed';

  @override
  String get auditActionSessionCancel => 'Session Cancelled';

  @override
  String get auditActionSessionCreate => 'Session Created';

  @override
  String get auditActionSessionUpdate => 'Session Updated';

  @override
  String get auditActionSessionDelete => 'Session Deleted';

  @override
  String get auditActionSessionNoShow => 'Session Marked No Show';

  @override
  String get auditActionPatientCreate => 'Patient Created';

  @override
  String get auditActionPatientUpdate => 'Patient Updated';

  @override
  String get auditActionPatientDelete => 'Patient Deleted';

  @override
  String get auditActionTreatmentPlanCreate => 'Treatment Plan Created';

  @override
  String get auditActionGoalAdd => 'Goal Added';

  @override
  String get auditActionExerciseAssign => 'Exercise Assigned';

  @override
  String get auditActionParentLink => 'Parent Linked';

  @override
  String get auditActionSpecialistAssign => 'Specialist Assigned';

  @override
  String get auditActionUserCreate => 'User Created';

  @override
  String get auditActionUserUpdate => 'User Updated';

  @override
  String get auditActionUserDelete => 'User Deleted';

  @override
  String get auditActionCaseCategoryCreate => 'Case Category Created';

  @override
  String get auditActionCaseCategoryUpdate => 'Case Category Updated';

  @override
  String get auditActionSpecialistCaseCategoriesUpdate =>
      'Specialist Categories Updated';

  @override
  String get auditActionCaseIntakeRequestCreate => 'Case Request Created';

  @override
  String get auditActionCaseIntakeRequestUpdate => 'Case Request Updated';

  @override
  String get auditActionCaseIntakeAttachmentAdd => 'Attachment Added';

  @override
  String get auditActionCaseIntakeAttachmentDelete => 'Attachment Deleted';

  @override
  String get auditActionCaseIntakeRequestAssign => 'Case Request Assigned';

  @override
  String get auditActionCaseIntakeAssessmentStart => 'Assessment Started';

  @override
  String get auditActionCaseIntakeAssessmentNotesUpdate =>
      'Assessment Notes Updated';

  @override
  String get auditActionCaseIntakeRequestAccept => 'Case Request Accepted';

  @override
  String get auditActionCaseIntakeRequestReject => 'Case Request Rejected';

  @override
  String get auditActionCaseIntakeRequestConvert => 'Case Converted to Patient';

  @override
  String get auditEntityCaseCategory => 'Case Category';

  @override
  String get auditEntityAssignedExercise => 'Assigned Exercise';

  @override
  String get auditEntitySubmission => 'Submission';

  @override
  String get auditEntityReview => 'Review';

  @override
  String get auditEntitySpeechAnalysis => 'Speech Analysis';

  @override
  String get auditEntityAiRecommendation => 'AI Recommendation';

  @override
  String get auditEntityAiReport => 'AI Report';

  @override
  String get authPasswordRequirementsDescription =>
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';

  @override
  String get authAlreadyHaveAccount => 'Already have an account? ';

  @override
  String get authCompleteRequiredFields =>
      'Please complete all required fields';

  @override
  String get authPasswordsDoNotMatch => 'Passwords do not match.';

  @override
  String get authRegisterUnableToCreate =>
      'Unable to create your account right now. Please try again.';

  @override
  String get authUploadProfileFailed =>
      'Unable to upload your profile photo right now.';

  @override
  String get authUploadProfileRetry =>
      'Unable to upload your profile photo. Please try again.';

  @override
  String get authSendResetLinkUnable =>
      'Unable to send the reset link right now. Please try again.';

  @override
  String get authResetPasswordUnable =>
      'Unable to reset your password right now. Please try again.';

  @override
  String get authVerifyEmailUnable =>
      'Unable to verify your email right now. Please try again later.';

  @override
  String get authVerifyEmailResendUnable =>
      'Unable to send the verification email right now. Please try again.';

  @override
  String get authRegistrationFailed => 'Registration failed. Please try again.';

  @override
  String get signupCreateYourAccount => 'Create Your Account';

  @override
  String get signupStepSubtitleRole =>
      'Choose how you\'ll use Smart Rehabilitation.';

  @override
  String get signupStepSubtitlePersonal => 'Tell us a little about yourself.';

  @override
  String get signupStepSubtitleProfessional =>
      'Tell us about your professional background.';

  @override
  String get signupStepSubtitleSecurity =>
      'Secure your account with a strong password.';

  @override
  String get signupStepSubtitleReview =>
      'Review your details before creating your account.';

  @override
  String get signupCompletePersonalFields =>
      'Please complete all required personal fields';

  @override
  String get signupCompleteProfessionalFields =>
      'Please complete all required professional fields';

  @override
  String get signupTermsRequired =>
      'You must accept the Terms of Service and Privacy Policy.';

  @override
  String get signupSelectRoleRequired => 'Please select your role';

  @override
  String get signupPhotoSelectFailed =>
      'Unable to select your profile photo right now.';

  @override
  String get signupCameraPermissionDenied =>
      'Camera access is required to take a photo. Enable camera permission in your device settings if it was denied.';

  @override
  String get signupCameraUnavailable =>
      'Camera is unavailable on this device right now.';

  @override
  String get signupCameraOpenFailed =>
      'Unable to open the camera. Please try again or choose from gallery.';

  @override
  String get signupGalleryPermissionDenied =>
      'Photo library access is required to choose a photo. Enable photo permissions in your device settings if they were denied.';

  @override
  String get signupGalleryOpenFailed =>
      'Unable to open the photo library. Please try again.';

  @override
  String get signupRoleParentDescription =>
      'Monitor your child\'s progress, communicate with specialists, and complete home exercises.';

  @override
  String get signupRoleSpecialistDescription =>
      'Manage patients, create treatment plans, review progress, and provide professional guidance.';

  @override
  String signupStepProgress(int current, int total) {
    return 'Step $current of $total';
  }

  @override
  String get signupProfilePhoto => 'Profile Photo';

  @override
  String get signupProfilePhotoTapChange => 'Tap to change photo';

  @override
  String get signupProfilePhotoTapUpload => 'Click to upload';

  @override
  String get signupProfilePhotoSemanticChange => 'Profile photo, tap to change';

  @override
  String get signupProfilePhotoSemanticUpload => 'Profile photo, tap to upload';

  @override
  String get signupChooseProfilePhoto => 'Choose Profile Photo';

  @override
  String get signupTakePhoto => 'Take a Photo';

  @override
  String get signupTakePhotoSubtitle =>
      'Use your camera to capture a new photo.';

  @override
  String get signupTakePhotoSemantic => 'Take a photo with camera';

  @override
  String get signupChooseFromGallery => 'Choose from Gallery';

  @override
  String get signupChooseFromGallerySubtitle =>
      'Select an existing photo from your device.';

  @override
  String get signupChooseFromGallerySemantic => 'Choose a photo from gallery';

  @override
  String get signupCancelPhotoSelection => 'Cancel profile photo selection';

  @override
  String get signupFullNameHint => 'Dr. Sarah Johnson';

  @override
  String get signupEmailAddress => 'Email Address';

  @override
  String get signupPhoneNumber => 'Phone Number';

  @override
  String get signupPhoneHint => '+970 59 000 0000';

  @override
  String get signupSpecializationHint => 'Speech Therapy';

  @override
  String get signupBioHint => 'Brief professional bio';

  @override
  String signupBioCounter(int length) {
    return '$length / 500';
  }

  @override
  String get signupPasswordHint => 'Min. 8 characters';

  @override
  String get signupConfirmPassword => 'Confirm Password';

  @override
  String get signupConfirmPasswordHint => 'Re-enter your password';

  @override
  String get signupTermsAgreement =>
      'I agree to the Terms of Service and Privacy Policy.';

  @override
  String get signupAccountType => 'Account Type';

  @override
  String get signupPersonalDetails => 'Personal Details';

  @override
  String get signupProfessionalDetails => 'Professional Details';

  @override
  String get signupSecuritySection => 'Security';

  @override
  String get signupExperience => 'Experience';

  @override
  String get signupEdit => 'Edit';

  @override
  String get signupPasswordCreatedSecurely => 'Password created securely';

  @override
  String get signupReviewConfirmAccuracy =>
      'By creating this account, you confirm that the information above is accurate.';

  @override
  String get signupCreatingAccount => 'Creating Account...';

  @override
  String signupExperienceYears(int count) {
    return '$count years';
  }

  @override
  String get signupExperienceOneYear => '1 year';

  @override
  String get signupValidationSpecializationRequired =>
      'Specialization is required.';

  @override
  String get signupValidationSpecializationMax =>
      'Specialization must not exceed 150 characters.';

  @override
  String get signupValidationLicenseRequired => 'License number is required.';

  @override
  String get signupValidationLicenseMax =>
      'License number must not exceed 100 characters.';

  @override
  String get signupValidationExperienceRequired =>
      'Years of experience is required.';

  @override
  String get signupValidationExperienceMin =>
      'Years of experience must be at least 0.';

  @override
  String get signupValidationBioMax => 'Bio must not exceed 500 characters.';

  @override
  String get forgotPasswordTitle => 'Forgot Password';

  @override
  String get forgotPasswordSubtitle =>
      'Enter your email address and we will send you a password reset link.';

  @override
  String get forgotPasswordEnterEmail => 'Please enter your email address';

  @override
  String get forgotPasswordEnterValidEmail =>
      'Please enter a valid email address';

  @override
  String get forgotPasswordSending => 'Sending Reset Link...';

  @override
  String get forgotPasswordSendLink => 'Send Reset Link';

  @override
  String get forgotPasswordResetEmailSentTitle => 'Reset Email Sent';

  @override
  String get forgotPasswordResetEmailSentMessage =>
      'If an account exists with this email, a password reset link has been sent.';

  @override
  String get forgotPasswordFailedSend => 'Failed to send reset link.';

  @override
  String get forgotPasswordBackToSignIn => 'Back to Sign In';

  @override
  String get resetPasswordTitle => 'Reset Password';

  @override
  String get resetPasswordSubtitle => 'Enter your new password below.';

  @override
  String get resetPasswordNewPassword => 'New Password';

  @override
  String get resetPasswordNewPasswordHint => 'Enter your new password';

  @override
  String get resetPasswordConfirmPassword => 'Confirm New Password';

  @override
  String get resetPasswordConfirmHint => 'Re-enter your new password';

  @override
  String get resetPasswordResetting => 'Resetting Password...';

  @override
  String get resetPasswordCompleteTitle => 'Password Reset Complete';

  @override
  String get resetPasswordCompleteMessage =>
      'Your password has been changed successfully.';

  @override
  String get resetPasswordFailed => 'Failed to reset password.';

  @override
  String get resetPasswordBackToSignIn => 'Back to Sign In';

  @override
  String get verifyEmailPendingMessage =>
      'Please check your email and open the verification link on this device.';

  @override
  String get verifyEmailCheckTitle => 'Check Your Email';

  @override
  String get verifyEmailCheckMessage =>
      'We sent a verification link to your email address. Open the link on this device to activate your account.';

  @override
  String get verifyEmailVerifyingTitle => 'Verifying Email';

  @override
  String get verifyEmailVerifyingMessage => 'We are verifying your email now.';

  @override
  String get verifyEmailSuccessTitle => 'Email Verified';

  @override
  String get verifyEmailSuccessMessage =>
      'Your email has been verified successfully. You can now sign in.';

  @override
  String get verifyEmailGoToLogin => 'Go to Login';

  @override
  String get verifyEmailFailedTitle => 'Verification Failed';

  @override
  String get verifyEmailFailedDefault =>
      'Unable to verify your email right now.';

  @override
  String get verifyEmailResending => 'Sending...';

  @override
  String get verifyEmailResend => 'Resend Verification Email';

  @override
  String get verifyEmailHideManual => 'Hide manual verification';

  @override
  String get verifyEmailShowManual => 'Already have a verification link?';

  @override
  String get verifyEmailTokenLabel => 'Verification link or token';

  @override
  String get verifyEmailTokenHint => 'Paste the link or token from your email';

  @override
  String get verifyEmailVerifyButton => 'Verify Email';

  @override
  String get verifyEmailEnterToken =>
      'Enter the verification token or paste the full verification link.';

  @override
  String get verifyEmailEmailMissing =>
      'Email address is missing. Please sign up again or contact support.';

  @override
  String get verifyEmailResendFailed =>
      'Unable to resend the verification email right now.';

  @override
  String get verifyEmailBackToSignIn => 'Back to Sign In';

  @override
  String get splashTitleLine1 => '';

  @override
  String get splashTitleSmart => 'Smart';

  @override
  String get splashTitleRehabilitation => 'Rehabilitation';

  @override
  String get splashSubtitle =>
      'Empowering rehabilitation through smart daily follow-up';

  @override
  String get splashFeatureAiProgress => 'AI Progress Tracking';

  @override
  String get splashFeatureExerciseGuidance => 'Smart Exercise Guidance';

  @override
  String get splashFeatureSpeechMotion => 'Speech & Motion Analysis';

  @override
  String get splashGetStarted => 'Get Started';

  @override
  String get splashCopyright => '© Smart Rehabilitation Platform';

  @override
  String parentAiAssistantForChild(String childName) {
    return 'For $childName';
  }

  @override
  String get parentAiAssistantDisclaimer =>
      'AI guidance is for support only. Always follow your specialist\'s instructions.';

  @override
  String get parentAiAssistantIntro =>
      'Ask me anything about your child\'s exercises, reports, or progress.';

  @override
  String get parentAiAssistantPromptExplainExercise =>
      'Explain today\'s exercise';

  @override
  String get parentAiAssistantPromptSummarizeProgress =>
      'Summarize my child\'s progress';

  @override
  String get parentAiAssistantPromptFocusToday =>
      'What should I focus on today?';

  @override
  String get parentAiAssistantPromptExplainReport =>
      'Explain the latest report';

  @override
  String get parentAiAssistantInputHint =>
      'Ask about exercises, reports, or progress...';

  @override
  String get parentAiAssistantThinking => 'AI is thinking...';

  @override
  String get parentAiAssistantSending => 'Sending...';

  @override
  String get parentAiAssistantFailedToSend => 'Failed to send';

  @override
  String get complaintMoreReportSpecialist => 'Report a Specialist';

  @override
  String get complaintMoreReportSpecialistSubtitle =>
      'Submit a concern for administration review';

  @override
  String get complaintFormTitle => 'Report a Specialist';

  @override
  String get complaintFormIntro =>
      'Your complaint will be reviewed by the administration only. It will not be sent directly to the specialist.';

  @override
  String get complaintHistoryTitle => 'My Complaints';

  @override
  String get complaintFormChildLabel => 'Child';

  @override
  String get complaintFormSpecialistLabel => 'Specialist';

  @override
  String get complaintFormCategoryLabel => 'Complaint Category';

  @override
  String get complaintFormDescriptionLabel => 'Description';

  @override
  String get complaintFormDescriptionHint =>
      'Describe your concern in detail (minimum 20 characters)';

  @override
  String complaintFormDescriptionCounter(int count) {
    return '$count/1000';
  }

  @override
  String get complaintFormDescriptionTooShort =>
      'Description must be at least 20 characters.';

  @override
  String get complaintFormDescriptionTooLong =>
      'Description must not exceed 1000 characters.';

  @override
  String get complaintFormSelectChild => 'Please select a child.';

  @override
  String get complaintFormSelectSpecialist => 'Please select a specialist.';

  @override
  String get complaintFormSelectCategory =>
      'Please select a complaint category.';

  @override
  String get complaintFormNoSpecialistAssigned =>
      'No specialist is assigned to this child.';

  @override
  String get complaintFormAttachmentLabel => 'Attachment (optional)';

  @override
  String get complaintFormAttachmentHint => 'Supported formats: image or PDF.';

  @override
  String get complaintFormAddAttachment => 'Add attachment';

  @override
  String get complaintFormRemoveAttachment => 'Remove attachment';

  @override
  String get complaintFormAttachmentPickFailed =>
      'Could not read the selected file.';

  @override
  String get complaintFormAttachmentUploadFailed =>
      'Failed to upload attachment. Please try again.';

  @override
  String get complaintFormSubmit => 'Submit Complaint';

  @override
  String get complaintFormSubmitting => 'Submitting...';

  @override
  String get complaintFormSubmittedSuccess =>
      'Your complaint has been submitted successfully and will be reviewed by the administration.';

  @override
  String get complaintFormSubmitFailed =>
      'Failed to submit complaint. Please try again.';

  @override
  String get complaintFormDuplicateActiveError =>
      'An active complaint already exists for this child, specialist, and category.';

  @override
  String get complaintFormSpecialistNotAssigned =>
      'The selected specialist is not assigned to this child.';

  @override
  String get complaintFormChildNotAuthorized =>
      'You are not authorized to submit a complaint for this child.';

  @override
  String complaintFormLoadFailed(String error) {
    return 'Failed to load form data: $error';
  }

  @override
  String get complaintCategorySpecialistNotResponding =>
      'Specialist is not responding';

  @override
  String get complaintCategoryPoorFollowUp => 'Poor follow-up';

  @override
  String get complaintCategoryRepeatedSessionCancellations =>
      'Missed or repeatedly cancelled sessions';

  @override
  String get complaintCategoryDelayedExerciseFeedback =>
      'Delayed exercise feedback';

  @override
  String get complaintCategoryInappropriateCommunication =>
      'Inappropriate communication';

  @override
  String get complaintCategoryOther => 'Other';

  @override
  String get complaintStatusPending => 'Pending';

  @override
  String get complaintStatusUnderReview => 'Under Review';

  @override
  String get complaintStatusResolved => 'Resolved';

  @override
  String get complaintStatusRejected => 'Rejected';

  @override
  String get complaintHistoryEmptyTitle => 'No complaints yet';

  @override
  String get complaintHistoryEmptyMessage =>
      'If you have a concern about an assigned specialist, you can submit a complaint for administration review.';

  @override
  String complaintHistoryChildSpecialist(
    String childName,
    String specialistName,
  ) {
    return '$childName · $specialistName';
  }

  @override
  String get complaintDateUnavailable => 'Date unavailable';

  @override
  String get complaintDetailsTitle => 'Complaint Details';

  @override
  String get complaintDetailsNotFound => 'Complaint not found.';

  @override
  String get complaintDetailsSubmitted => 'Submitted';

  @override
  String get complaintDetailsStatus => 'Status';

  @override
  String get complaintDetailsAdminResponse => 'Administration Response';

  @override
  String get adminComplaintsTitle => 'Complaints Management';

  @override
  String get adminComplaintsDescription =>
      'Review specialist complaints submitted by parents and manage review actions.';

  @override
  String get adminComplaintsLoading => 'Loading complaints...';

  @override
  String get adminComplaintsEmpty => 'No complaints found.';

  @override
  String get adminComplaintsNoMatch =>
      'No complaints match the selected filters.';

  @override
  String get adminComplaintsAllStatuses => 'All Statuses';

  @override
  String get adminComplaintsAllCategories => 'All Categories';

  @override
  String get adminComplaintsAllSpecialists => 'All Specialists';

  @override
  String get adminComplaintsDateRange => 'Date range';

  @override
  String get adminComplaintsDateRangeSelected => 'Date range selected';

  @override
  String adminComplaintsParentLabel(String name) {
    return 'Parent: $name';
  }

  @override
  String adminComplaintsChildLabel(String name) {
    return 'Child: $name';
  }

  @override
  String adminComplaintsSpecialistLabel(String name) {
    return 'Specialist: $name';
  }

  @override
  String get adminComplaintDetailsTitle => 'Complaint Details';

  @override
  String get adminComplaintFieldParent => 'Parent';

  @override
  String get adminComplaintFieldChild => 'Child';

  @override
  String get adminComplaintFieldSpecialist => 'Specialist';

  @override
  String get adminComplaintReviewer => 'Reviewed by';

  @override
  String get adminComplaintReviewedAt => 'Review date';

  @override
  String get adminComplaintAdminNotes => 'Admin notes';

  @override
  String get adminComplaintAdminNotesHint =>
      'Required when resolving or rejecting a complaint';

  @override
  String get adminComplaintAdminNotesRequired =>
      'Admin notes are required to resolve or reject this complaint.';

  @override
  String get adminComplaintParentResponse => 'Parent response (optional)';

  @override
  String get adminComplaintParentResponseHint =>
      'Safe message visible to the parent after review';

  @override
  String get adminComplaintStartReview => 'Start Review';

  @override
  String get adminComplaintStartReviewTitle => 'Start review?';

  @override
  String get adminComplaintStartReviewMessage =>
      'This complaint will be marked as under review.';

  @override
  String get adminComplaintStartReviewSuccess =>
      'Complaint marked as under review.';

  @override
  String get adminComplaintResolve => 'Resolve Complaint';

  @override
  String get adminComplaintResolveTitle => 'Resolve complaint?';

  @override
  String get adminComplaintResolveMessage =>
      'This will confirm the complaint after review.';

  @override
  String get adminComplaintResolveSuccess => 'Complaint resolved successfully.';

  @override
  String get adminComplaintReject => 'Reject Complaint';

  @override
  String get adminComplaintRejectTitle => 'Reject complaint?';

  @override
  String get adminComplaintRejectMessage =>
      'This complaint will be marked as rejected after review.';

  @override
  String get adminComplaintRejectSuccess => 'Complaint rejected successfully.';

  @override
  String get adminComplaintInvalidTransition =>
      'This status change is not allowed for the current complaint.';

  @override
  String get supportRequestTitle => 'Support';

  @override
  String get supportRequestAdminTitle => 'Support Requests';

  @override
  String get supportRequestAdminDescription =>
      'Review and respond to specialist support requests.';

  @override
  String get supportRequestNewRequest => 'New Request';

  @override
  String get supportRequestDetailsTitle => 'Support Request';

  @override
  String get supportRequestAdminDetailsTitle => 'Support Request Details';

  @override
  String get supportRequestCategoryLabel => 'Category';

  @override
  String get supportRequestSubjectLabel => 'Subject';

  @override
  String get supportRequestDescriptionLabel => 'Description';

  @override
  String get supportRequestDescriptionHint =>
      'Describe your issue in detail (minimum 20 characters)';

  @override
  String supportRequestDescriptionCounter(int count) {
    return '$count/2000';
  }

  @override
  String get supportRequestAttachmentLabel => 'Attachment (optional)';

  @override
  String get supportRequestAddAttachment => 'Add attachment';

  @override
  String get supportRequestSubmitRequest => 'Submit Request';

  @override
  String get supportRequestSubmitting => 'Submitting...';

  @override
  String get supportRequestReply => 'Reply';

  @override
  String get supportRequestReplyLabel => 'Your reply';

  @override
  String get supportRequestReplyHint => 'Write your message...';

  @override
  String get supportRequestReplyRequired =>
      'Enter a message or add an attachment.';

  @override
  String get supportRequestSending => 'Sending...';

  @override
  String get supportRequestMarkInProgress => 'Mark In Progress';

  @override
  String get supportRequestMarkResolved => 'Mark Resolved';

  @override
  String get supportRequestMarkInProgressTitle => 'Mark in progress?';

  @override
  String get supportRequestMarkInProgressMessage =>
      'This support request will be marked as in progress.';

  @override
  String get supportRequestMarkInProgressSuccess =>
      'Support request marked as in progress.';

  @override
  String get supportRequestMarkResolvedTitle => 'Mark resolved?';

  @override
  String get supportRequestMarkResolvedMessage =>
      'This support request will be marked as resolved and become read-only.';

  @override
  String get supportRequestMarkResolvedSuccess =>
      'Support request marked as resolved.';

  @override
  String get supportRequestEmpty => 'No support requests yet.';

  @override
  String get supportRequestNoMatch =>
      'No support requests match the selected filters.';

  @override
  String get supportRequestLoading => 'Loading support requests...';

  @override
  String get supportRequestResolvedTitle => 'This request is resolved';

  @override
  String get supportRequestResolvedReadOnly =>
      'The conversation is now read-only.';

  @override
  String get supportRequestConversationTitle => 'Conversation';

  @override
  String get supportRequestCreatedLabel => 'Created';

  @override
  String get supportRequestLastActivityLabel => 'Last activity';

  @override
  String get supportRequestResolvedDateLabel => 'Resolved';

  @override
  String get supportRequestDateUnavailable => 'Date unavailable';

  @override
  String supportRequestLastActivity(String date) {
    return 'Last activity: $date';
  }

  @override
  String supportRequestCreatedDate(String date) {
    return 'Created: $date';
  }

  @override
  String supportRequestSpecialistLabel(String name) {
    return 'Specialist: $name';
  }

  @override
  String get supportRequestSpecialistFieldLabel => 'Specialist';

  @override
  String get supportRequestSpecialistEmailLabel => 'Specialist email';

  @override
  String get supportRequestSenderAdmin => 'Administration';

  @override
  String get supportRequestSenderSpecialist => 'Specialist';

  @override
  String get supportRequestRequestStatusLabel => 'Request status';

  @override
  String get supportRequestAllStatuses => 'All Statuses';

  @override
  String get supportRequestAllCategories => 'All Categories';

  @override
  String get supportRequestAllSpecialists => 'All Specialists';

  @override
  String get supportRequestSelectCategory => 'Please select a category.';

  @override
  String get supportRequestSubjectTooShort =>
      'Subject must be at least 3 characters.';

  @override
  String get supportRequestSubjectTooLong =>
      'Subject must not exceed 200 characters.';

  @override
  String get supportRequestDescriptionTooShort =>
      'Description must be at least 20 characters.';

  @override
  String get supportRequestDescriptionTooLong =>
      'Description must not exceed 2000 characters.';

  @override
  String get supportRequestAttachmentPickFailed =>
      'Could not read the selected file.';

  @override
  String get supportRequestAttachmentUploadFailed =>
      'Failed to upload attachment.';

  @override
  String get supportRequestAttachmentInvalidType =>
      'Unsupported attachment type. Allowed: JPEG, PNG, WebP, and PDF.';

  @override
  String get supportRequestAttachmentTooLarge =>
      'Attachment is too large. Maximum allowed size is 10 MB.';

  @override
  String get supportRequestAttachmentOpenPdf => 'Open PDF attachment';

  @override
  String get supportRequestAttachmentOpenImage => 'Open image attachment';

  @override
  String get supportRequestErrorResolved =>
      'This support request is resolved and cannot be updated.';

  @override
  String get supportRequestErrorNotFound => 'Support request not found.';

  @override
  String get supportRequestErrorForbidden =>
      'You are not authorized to access this support request.';

  @override
  String get supportRequestCategoryTechnicalIssue => 'Technical Issue';

  @override
  String get supportRequestCategoryPatientCaseIssue => 'Patient / Case Issue';

  @override
  String get supportRequestCategorySessionSchedulingIssue =>
      'Session / Scheduling Issue';

  @override
  String get supportRequestCategoryAccountProfileIssue =>
      'Account / Profile Issue';

  @override
  String get supportRequestCategoryExerciseContentIssue =>
      'Exercise / Content Issue';

  @override
  String get supportRequestCategoryOther => 'Other';

  @override
  String get supportRequestStatusPending => 'Pending';

  @override
  String get supportRequestStatusInProgress => 'In Progress';

  @override
  String get supportRequestStatusResolved => 'Resolved';
}
