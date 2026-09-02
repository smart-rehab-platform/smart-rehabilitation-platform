import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// Application title shown in the system task switcher.
  ///
  /// In en, this message translates to:
  /// **'Smart Rehabilitation'**
  String get appTitle;

  /// Primary action to persist changes.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// Dismiss an action or dialog without saving.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// Permanently remove an item.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// Open an item for modification.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// Apply changes to an existing record.
  ///
  /// In en, this message translates to:
  /// **'Update'**
  String get commonUpdate;

  /// Create or attach something new.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get commonAdd;

  /// Create a new record.
  ///
  /// In en, this message translates to:
  /// **'Create'**
  String get commonCreate;

  /// Compact action to generate a report or similar item.
  ///
  /// In en, this message translates to:
  /// **'Generate'**
  String get commonGenerate;

  /// Send a form or request for processing.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get commonSubmit;

  /// Confirm a choice or destructive action.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get commonConfirm;

  /// Proceed to the next step.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get commonContinue;

  /// Navigate to the previous screen.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// Go to the next step or page.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get commonNext;

  /// Go to the previous step or page.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get commonPrevious;

  /// Close a panel, sheet, or dialog.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// Try a failed action again.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// Search field or action label.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get commonSearch;

  /// Filter list or data.
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get commonFilter;

  /// Reload current data.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get commonRefresh;

  /// Assign a specialist, patient, or resource.
  ///
  /// In en, this message translates to:
  /// **'Assign'**
  String get commonAssign;

  /// Remove an association or attachment.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get commonRemove;

  /// Open a read-only detail view.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get commonView;

  /// Link to view all items in a dashboard section.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get commonSeeAll;

  /// Section or screen title for detail information.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get commonDetails;

  /// Download a file or report.
  ///
  /// In en, this message translates to:
  /// **'Download'**
  String get commonDownload;

  /// Upload a file or media.
  ///
  /// In en, this message translates to:
  /// **'Upload'**
  String get commonUpload;

  /// Attach a file to a message or record.
  ///
  /// In en, this message translates to:
  /// **'Attach'**
  String get commonAttach;

  /// Send a message or form.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get commonSend;

  /// Affirmative dialog button.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get commonYes;

  /// Negative dialog button.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get commonNo;

  /// Acknowledge a message or dialog.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get commonOk;

  /// Show all items in a filter.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get commonAll;

  /// No selection or empty option.
  ///
  /// In en, this message translates to:
  /// **'None'**
  String get commonNone;

  /// Field or input is not required.
  ///
  /// In en, this message translates to:
  /// **'Optional'**
  String get commonOptional;

  /// Field or input is mandatory.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get commonRequired;

  /// Additional menu or bottom navigation destination.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get commonMore;

  /// Generic loading state label.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get commonLoading;

  /// Shown while a save operation is in progress.
  ///
  /// In en, this message translates to:
  /// **'Saving…'**
  String get commonSaving;

  /// Authentication action to log in.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get commonSignIn;

  /// Authentication action to log out.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get commonSignOut;

  /// End the current session from navigation menus.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get commonLogout;

  /// Language preference setting label.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get commonLanguage;

  /// Main dashboard destination.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// Shared dashboard greeting with the signed-in user name.
  ///
  /// In en, this message translates to:
  /// **'Welcome back, {userName}'**
  String dashboardWelcomeBack(String userName);

  /// Label for the upcoming therapy session.
  ///
  /// In en, this message translates to:
  /// **'Next Session'**
  String get dashboardNextSession;

  /// Default loading state for role dashboards.
  ///
  /// In en, this message translates to:
  /// **'Loading dashboard...'**
  String get dashboardLoading;

  /// Home tab in bottom navigation.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// Patients list destination.
  ///
  /// In en, this message translates to:
  /// **'Patients'**
  String get navPatients;

  /// Exercises library or tasks destination.
  ///
  /// In en, this message translates to:
  /// **'Exercises'**
  String get navExercises;

  /// Clinical or progress reports destination.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get navReports;

  /// In-app notifications destination.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get navNotifications;

  /// Chat or messaging destination.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get navMessages;

  /// User profile destination.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// Application or account settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get navSettings;

  /// Admin user management destination.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get navUsers;

  /// Therapy sessions destination.
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get navSessions;

  /// Specialist exercise feedback destination.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get navFeedback;

  /// Case intake request inbox or list.
  ///
  /// In en, this message translates to:
  /// **'Case Requests'**
  String get navCaseRequests;

  /// Admin specialist complaints management.
  ///
  /// In en, this message translates to:
  /// **'Complaints'**
  String get navComplaints;

  /// Admin assignment of patients to specialists.
  ///
  /// In en, this message translates to:
  /// **'Patient Assignments'**
  String get navPatientAssignments;

  /// Admin system audit log destination.
  ///
  /// In en, this message translates to:
  /// **'Audit Logs'**
  String get navAuditLogs;

  /// Admin AI tools and oversight destination.
  ///
  /// In en, this message translates to:
  /// **'AI Center'**
  String get navAiCenter;

  /// Treatment plans list destination.
  ///
  /// In en, this message translates to:
  /// **'Treatment Plans'**
  String get navTreatmentPlans;

  /// Specialist exercise submissions awaiting review.
  ///
  /// In en, this message translates to:
  /// **'Pending Reviews'**
  String get navPendingReviews;

  /// Specialist sessions scheduled for today.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Sessions'**
  String get navTodaysSessions;

  /// Case requests assigned to the current specialist.
  ///
  /// In en, this message translates to:
  /// **'Assigned Case Requests'**
  String get navAssignedCaseRequests;

  /// Parent daily exercise tasks destination.
  ///
  /// In en, this message translates to:
  /// **'Daily Tasks'**
  String get navDailyTasks;

  /// Parent linked children list.
  ///
  /// In en, this message translates to:
  /// **'Children'**
  String get navChildren;

  /// Treatment progress overview destination.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get navProgress;

  /// Parent or guardian user role.
  ///
  /// In en, this message translates to:
  /// **'Parent'**
  String get roleParent;

  /// Therapy specialist user role.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get roleSpecialist;

  /// Platform administrator role.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get roleAdmin;

  /// Generic platform user.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get roleUser;

  /// Singular patient entity.
  ///
  /// In en, this message translates to:
  /// **'Patient'**
  String get entityPatient;

  /// Plural patients entity.
  ///
  /// In en, this message translates to:
  /// **'Patients'**
  String get entityPatients;

  /// Singular child in parent context.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get entityChild;

  /// Plural children in parent context.
  ///
  /// In en, this message translates to:
  /// **'Children'**
  String get entityChildren;

  /// Singular rehabilitation exercise.
  ///
  /// In en, this message translates to:
  /// **'Exercise'**
  String get entityExercise;

  /// Plural rehabilitation exercises.
  ///
  /// In en, this message translates to:
  /// **'Exercises'**
  String get entityExercises;

  /// Singular therapy session.
  ///
  /// In en, this message translates to:
  /// **'Session'**
  String get entitySession;

  /// Plural therapy sessions.
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get entitySessions;

  /// Singular clinical or progress report.
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get entityReport;

  /// Plural reports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get entityReports;

  /// Singular in-app notification.
  ///
  /// In en, this message translates to:
  /// **'Notification'**
  String get entityNotification;

  /// Plural notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get entityNotifications;

  /// Singular chat message.
  ///
  /// In en, this message translates to:
  /// **'Message'**
  String get entityMessage;

  /// Plural chat messages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get entityMessages;

  /// Singular treatment goal.
  ///
  /// In en, this message translates to:
  /// **'Goal'**
  String get entityGoal;

  /// Plural treatment goals.
  ///
  /// In en, this message translates to:
  /// **'Goals'**
  String get entityGoals;

  /// Singular platform user account.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get entityUser;

  /// Plural platform user accounts.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get entityUsers;

  /// File attached to a message or record.
  ///
  /// In en, this message translates to:
  /// **'Attachment'**
  String get entityAttachment;

  /// Chat thread between users.
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get entityConversation;

  /// Singular treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Treatment Plan'**
  String get entityTreatmentPlan;

  /// Plural treatment plans.
  ///
  /// In en, this message translates to:
  /// **'Treatment Plans'**
  String get entityTreatmentPlans;

  /// Singular case intake request.
  ///
  /// In en, this message translates to:
  /// **'Case Request'**
  String get entityCaseRequest;

  /// Plural case intake requests.
  ///
  /// In en, this message translates to:
  /// **'Case Requests'**
  String get entityCaseRequests;

  /// Record or account is active.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get statusActive;

  /// Record or account is inactive.
  ///
  /// In en, this message translates to:
  /// **'Inactive'**
  String get statusInactive;

  /// Generic pending state.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get statusPending;

  /// Request or item approved.
  ///
  /// In en, this message translates to:
  /// **'Approved'**
  String get statusApproved;

  /// Request or item rejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get statusRejected;

  /// Session, task, or plan completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get statusCompleted;

  /// Session or request cancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get statusCancelled;

  /// Session scheduled for a future time.
  ///
  /// In en, this message translates to:
  /// **'Scheduled'**
  String get statusScheduled;

  /// Case or request accepted.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get statusAccepted;

  /// Session was missed.
  ///
  /// In en, this message translates to:
  /// **'Missed'**
  String get statusMissed;

  /// Patient did not attend a scheduled session.
  ///
  /// In en, this message translates to:
  /// **'No Show'**
  String get statusNoShow;

  /// Past session that was not marked completed.
  ///
  /// In en, this message translates to:
  /// **'Not Completed'**
  String get statusNotCompleted;

  /// Case is being assessed by a specialist.
  ///
  /// In en, this message translates to:
  /// **'Under Assessment'**
  String get statusUnderAssessment;

  /// Case request awaiting admin review.
  ///
  /// In en, this message translates to:
  /// **'Pending Review'**
  String get statusPendingReview;

  /// A specialist has been assigned to a case.
  ///
  /// In en, this message translates to:
  /// **'Specialist Assigned'**
  String get statusSpecialistAssigned;

  /// Patient profile was created from a case.
  ///
  /// In en, this message translates to:
  /// **'Profile Created'**
  String get statusProfileCreated;

  /// Generic empty data state.
  ///
  /// In en, this message translates to:
  /// **'No data'**
  String get messageNoData;

  /// Generic error label.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get messageError;

  /// Generic success label.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get messageSuccess;

  /// Generic retry instruction after a failure.
  ///
  /// In en, this message translates to:
  /// **'Please try again.'**
  String get messagePleaseTryAgain;

  /// User must authenticate to proceed.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to continue.'**
  String get messageSignInRequired;

  /// Generic unexpected failure message.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong.'**
  String get messageSomethingWentWrong;

  /// Content is being loaded.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get messageLoadingContent;

  /// Current day label.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get dateToday;

  /// Previous day label.
  ///
  /// In en, this message translates to:
  /// **'Yesterday'**
  String get dateYesterday;

  /// Next day label.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get dateTomorrow;

  /// Current calendar week.
  ///
  /// In en, this message translates to:
  /// **'This Week'**
  String get dateThisWeek;

  /// Previous calendar week.
  ///
  /// In en, this message translates to:
  /// **'Last Week'**
  String get dateLastWeek;

  /// Filter showing all items.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// Filter for active records.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get filterActive;

  /// Filter for inactive records.
  ///
  /// In en, this message translates to:
  /// **'Inactive'**
  String get filterInactive;

  /// Calendar view mode.
  ///
  /// In en, this message translates to:
  /// **'Calendar'**
  String get filterCalendar;

  /// List view mode.
  ///
  /// In en, this message translates to:
  /// **'List'**
  String get filterList;

  /// Clinical assessment label.
  ///
  /// In en, this message translates to:
  /// **'Assessment'**
  String get clinicalAssessment;

  /// Speech analysis feature label.
  ///
  /// In en, this message translates to:
  /// **'Speech Analysis'**
  String get clinicalSpeechAnalysis;

  /// AI support chat feature label.
  ///
  /// In en, this message translates to:
  /// **'AI Assistant'**
  String get clinicalAiAssistant;

  /// Singular treatment plan clinical term.
  ///
  /// In en, this message translates to:
  /// **'Treatment Plan'**
  String get clinicalTreatmentPlan;

  /// Medical diagnosis label.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis'**
  String get clinicalDiagnosis;

  /// Treatment progress label.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get clinicalProgress;

  /// Current progress snapshot label.
  ///
  /// In en, this message translates to:
  /// **'Current Progress'**
  String get clinicalCurrentProgress;

  /// AI or clinical recommendation label.
  ///
  /// In en, this message translates to:
  /// **'Recommendation'**
  String get clinicalRecommendation;

  /// Exercise or case category label.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get clinicalCategory;

  /// Positive treatment trend indicator.
  ///
  /// In en, this message translates to:
  /// **'Improving'**
  String get clinicalTrendImproving;

  /// Neutral treatment trend indicator.
  ///
  /// In en, this message translates to:
  /// **'Stable'**
  String get clinicalTrendStable;

  /// Declining treatment trend indicator.
  ///
  /// In en, this message translates to:
  /// **'Needs Attention'**
  String get clinicalTrendNeedsAttention;

  /// Remote therapy session mode.
  ///
  /// In en, this message translates to:
  /// **'Online'**
  String get clinicalSessionOnline;

  /// In-clinic therapy session mode.
  ///
  /// In en, this message translates to:
  /// **'In Person'**
  String get clinicalSessionInPerson;

  /// Email address field label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get fieldEmail;

  /// Password field label.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get fieldPassword;

  /// Phone number field label.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get fieldPhone;

  /// Generic name field label.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get fieldName;

  /// Full name field label.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fieldFullName;

  /// Date of birth field label.
  ///
  /// In en, this message translates to:
  /// **'Date of Birth'**
  String get fieldDateOfBirth;

  /// Gender field label.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get fieldGender;

  /// Postal or home address field label.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get fieldAddress;

  /// User role field label on profile screens.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get fieldRole;

  /// Male gender option.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get fieldGenderMale;

  /// Female gender option.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get fieldGenderFemale;

  /// Shared auth tab label for account registration.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get authCommonCreateAccount;

  /// Heading for the shared password strength indicator.
  ///
  /// In en, this message translates to:
  /// **'Password strength'**
  String get authPasswordStrengthTitle;

  /// Weak password strength level label.
  ///
  /// In en, this message translates to:
  /// **'Weak'**
  String get authPasswordStrengthWeak;

  /// Medium password strength level label.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get authPasswordStrengthMedium;

  /// Strong password strength level label.
  ///
  /// In en, this message translates to:
  /// **'Strong'**
  String get authPasswordStrengthStrong;

  /// Password rule requiring minimum length.
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters'**
  String get authPasswordRuleMinLength;

  /// Password rule requiring an uppercase letter.
  ///
  /// In en, this message translates to:
  /// **'Contains uppercase letter'**
  String get authPasswordRuleUppercase;

  /// Password rule requiring a lowercase letter.
  ///
  /// In en, this message translates to:
  /// **'Contains lowercase letter'**
  String get authPasswordRuleLowercase;

  /// Password rule requiring a digit.
  ///
  /// In en, this message translates to:
  /// **'Contains number'**
  String get authPasswordRuleNumber;

  /// Password rule requiring a special character.
  ///
  /// In en, this message translates to:
  /// **'Contains special character'**
  String get authPasswordRuleSpecialCharacter;

  /// Validation message for malformed email input.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get authValidationInvalidEmail;

  /// Login form heading.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get loginTitle;

  /// Login form supporting subtitle.
  ///
  /// In en, this message translates to:
  /// **'Continue your smart rehabilitation journey'**
  String get loginSubtitle;

  /// Placeholder hint for the login email field.
  ///
  /// In en, this message translates to:
  /// **'name@example.com'**
  String get loginEmailHint;

  /// Placeholder hint for the login password field.
  ///
  /// In en, this message translates to:
  /// **'Enter your password'**
  String get loginPasswordHint;

  /// Remember me checkbox label on the login form.
  ///
  /// In en, this message translates to:
  /// **'Remember Me'**
  String get loginRememberMe;

  /// Link to the forgot password flow from login.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get loginForgotPassword;

  /// Login button label while authentication is in progress.
  ///
  /// In en, this message translates to:
  /// **'Signing In…'**
  String get loginSigningIn;

  /// Validation snackbar when login fields are empty.
  ///
  /// In en, this message translates to:
  /// **'Please enter email and password'**
  String get loginEnterEmailAndPassword;

  /// Snack bar shown after a successful login.
  ///
  /// In en, this message translates to:
  /// **'Login successful'**
  String get loginSuccess;

  /// Generic fallback message when login fails.
  ///
  /// In en, this message translates to:
  /// **'Login failed. Please try again.'**
  String get loginFailed;

  /// Fallback message when the login request cannot complete.
  ///
  /// In en, this message translates to:
  /// **'Unable to sign in right now. Please try again.'**
  String get loginUnableToSignIn;

  /// Shown when login succeeds but the user role is unknown.
  ///
  /// In en, this message translates to:
  /// **'Unable to determine your account role. Please contact support.'**
  String get loginUnableToDetermineRole;

  /// Login form button shown when email verification is required.
  ///
  /// In en, this message translates to:
  /// **'Go to Email Verification'**
  String get loginGoToEmailVerification;

  /// Login footer prompt before the create account link.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? '**
  String get loginNoAccountPrompt;

  /// Accessibility label for revealing the login password.
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get loginShowPassword;

  /// Accessibility label for concealing the login password.
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get loginHidePassword;

  /// Section header for daily assigned exercises.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Tasks'**
  String get parentDashboardTodaysTasks;

  /// Section header for recent reports and feedback.
  ///
  /// In en, this message translates to:
  /// **'Latest Updates'**
  String get parentDashboardLatestUpdates;

  /// Title for the child picker bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'Select Child'**
  String get parentDashboardSelectChild;

  /// Accessibility label for the child switcher control.
  ///
  /// In en, this message translates to:
  /// **'Select child, currently {childName}'**
  String parentDashboardSelectChildSemantics(String childName);

  /// Label for aggregate treatment progress on the hero card.
  ///
  /// In en, this message translates to:
  /// **'Overall Progress'**
  String get parentDashboardOverallProgress;

  /// Encouragement shown below the progress bar.
  ///
  /// In en, this message translates to:
  /// **'Keep going!'**
  String get parentDashboardKeepGoing;

  /// Link to open child detail from the hero card.
  ///
  /// In en, this message translates to:
  /// **'View Details →'**
  String get parentDashboardViewDetailsArrow;

  /// Heading for the daily tasks and sessions summary row.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Summary'**
  String get parentDashboardTodaysSummary;

  /// Compact summary card title for daily tasks.
  ///
  /// In en, this message translates to:
  /// **'Tasks'**
  String get parentDashboardTasksLabel;

  /// Empty state when no reports or feedback exist.
  ///
  /// In en, this message translates to:
  /// **'No recent reports or specialist feedback yet.'**
  String get parentDashboardNoRecentUpdates;

  /// Label for the latest weekly report card.
  ///
  /// In en, this message translates to:
  /// **'Weekly Progress Report'**
  String get parentDashboardWeeklyProgressReport;

  /// Label for the most recent specialist feedback card.
  ///
  /// In en, this message translates to:
  /// **'Latest Specialist Feedback'**
  String get parentDashboardLatestSpecialistFeedback;

  /// Heading for the AI-generated daily insight card.
  ///
  /// In en, this message translates to:
  /// **'AI Daily Insight'**
  String get parentDashboardAiDailyInsight;

  /// Prompt on the AI assistant card.
  ///
  /// In en, this message translates to:
  /// **'Need help understanding your child\'s progress?'**
  String get parentDashboardAiAssistantHelp;

  /// Secondary hint on the AI assistant card.
  ///
  /// In en, this message translates to:
  /// **'Ask about exercises, reports, or daily guidance.'**
  String get parentDashboardAiAssistantHint;

  /// Button label to open the AI chat.
  ///
  /// In en, this message translates to:
  /// **'Ask AI'**
  String get parentDashboardAskAi;

  /// Most recent pronunciation score on the speech analysis card.
  ///
  /// In en, this message translates to:
  /// **'Last pronunciation score: {score}%'**
  String parentDashboardLastPronunciationScore(int score);

  /// Score change compared to the previous speech attempt.
  ///
  /// In en, this message translates to:
  /// **'{delta} from previous attempt'**
  String parentDashboardDeltaFromPrevious(String delta);

  /// Speech analysis metric label.
  ///
  /// In en, this message translates to:
  /// **'Pronunciation'**
  String get parentDashboardPronunciation;

  /// Speech analysis metric label.
  ///
  /// In en, this message translates to:
  /// **'Fluency'**
  String get parentDashboardFluency;

  /// Overall speech score chip label.
  ///
  /// In en, this message translates to:
  /// **'Overall'**
  String get parentDashboardOverall;

  /// Loading state while refreshing selected child data.
  ///
  /// In en, this message translates to:
  /// **'Updating child insights...'**
  String get parentDashboardUpdatingInsights;

  /// Indicates an exercise needs to be attempted again.
  ///
  /// In en, this message translates to:
  /// **'Retry required'**
  String get parentDashboardRetryRequired;

  /// Link to open detail view.
  ///
  /// In en, this message translates to:
  /// **'View Details'**
  String get parentDashboardViewDetails;

  /// Tasks summary when none are completed yet.
  ///
  /// In en, this message translates to:
  /// **'Assigned for today'**
  String get parentDashboardAssignedForToday;

  /// Daily task completion summary.
  ///
  /// In en, this message translates to:
  /// **'{completed} of {total} completed'**
  String parentDashboardCompletedCount(int completed, int total);

  /// Singular upcoming session summary footer.
  ///
  /// In en, this message translates to:
  /// **'Session scheduled'**
  String get parentDashboardSessionScheduled;

  /// Plural upcoming sessions summary footer.
  ///
  /// In en, this message translates to:
  /// **'Sessions scheduled'**
  String get parentDashboardSessionsScheduled;

  /// Consecutive days of rehabilitation activity.
  ///
  /// In en, this message translates to:
  /// **'{days}-day rehab streak'**
  String parentDashboardRehabStreak(int days);

  /// Snack bar when progress is opened without a selected child.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view progress.'**
  String get parentDashboardSelectChildForProgress;

  /// Snack bar when feedback is opened without a selected child.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view feedback.'**
  String get parentDashboardSelectChildForFeedback;

  /// Snack bar when child details are opened without a selection.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view details.'**
  String get parentDashboardSelectChildForDetails;

  /// Snack bar when no daily exercises are available.
  ///
  /// In en, this message translates to:
  /// **'No exercises assigned today.'**
  String get parentDashboardNoExercisesToday;

  /// Snack bar when reports list is empty.
  ///
  /// In en, this message translates to:
  /// **'No reports available yet.'**
  String get parentDashboardNoReportsYet;

  /// Snack bar when case conversation cannot be opened.
  ///
  /// In en, this message translates to:
  /// **'Conversation is not available yet.'**
  String get parentDashboardConversationUnavailable;

  /// Empty tasks state before a child profile exists.
  ///
  /// In en, this message translates to:
  /// **'Daily tasks will appear after the child profile is created and a specialist assigns exercises.'**
  String get parentDashboardTasksEmptyAwaitingProfile;

  /// Empty tasks state when no child is selected.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view today\'s tasks.'**
  String get parentDashboardTasksEmptySelectChild;

  /// Empty tasks state for a selected child with no assignments.
  ///
  /// In en, this message translates to:
  /// **'No tasks assigned for {childName} today.'**
  String parentDashboardTasksEmptyForChild(String childName);

  /// Default category label on the parent hero card.
  ///
  /// In en, this message translates to:
  /// **'Rehabilitation follow-up'**
  String get parentDashboardRehabilitationFollowUp;

  /// Improvement delta shown on the hero card.
  ///
  /// In en, this message translates to:
  /// **'{delta} improvement from previous attempt'**
  String parentDashboardImprovementFromPrevious(String delta);

  /// Fallback date label when no date is available.
  ///
  /// In en, this message translates to:
  /// **'Recently'**
  String get parentDashboardRecently;

  /// Hero card label when no session is scheduled.
  ///
  /// In en, this message translates to:
  /// **'No upcoming session'**
  String get parentSessionNoUpcoming;

  /// Session countdown for one day away.
  ///
  /// In en, this message translates to:
  /// **'In 1 day'**
  String get parentSessionInOneDay;

  /// Session countdown for multiple days away.
  ///
  /// In en, this message translates to:
  /// **'In {count} days'**
  String parentSessionInDays(int count);

  /// Session countdown for one minute away.
  ///
  /// In en, this message translates to:
  /// **'In 1 minute'**
  String get parentSessionInOneMinute;

  /// Session countdown for multiple minutes away.
  ///
  /// In en, this message translates to:
  /// **'In {count} minutes'**
  String parentSessionInMinutes(int count);

  /// Session countdown for one hour away.
  ///
  /// In en, this message translates to:
  /// **'In 1 hour'**
  String get parentSessionInOneHour;

  /// Session countdown for multiple hours away.
  ///
  /// In en, this message translates to:
  /// **'In {count} hours'**
  String parentSessionInHours(int count);

  /// Title for the treatment journey preview card.
  ///
  /// In en, this message translates to:
  /// **'Treatment Journey'**
  String get parentTreatmentJourneyTitle;

  /// Subtitle for the treatment journey preview card.
  ///
  /// In en, this message translates to:
  /// **'Progress throughout the treatment period'**
  String get parentTreatmentJourneySubtitle;

  /// Link on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'View details'**
  String get parentTreatmentJourneyViewDetails;

  /// Error message on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load treatment progress.'**
  String get parentTreatmentJourneyLoadError;

  /// Empty state on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'Progress will appear after exercises are reviewed.'**
  String get parentTreatmentJourneyEmpty;

  /// Positive score change on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'+{points} points'**
  String parentTreatmentJourneyScoreChangePositive(int points);

  /// Negative score change on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'{points} points'**
  String parentTreatmentJourneyScoreChangeNegative(int points);

  /// Zero score change on the treatment journey card.
  ///
  /// In en, this message translates to:
  /// **'0 points'**
  String get parentTreatmentJourneyScoreChangeZero;

  /// Screen reader label while journey data loads.
  ///
  /// In en, this message translates to:
  /// **'Treatment Journey, loading progress'**
  String get parentTreatmentJourneySemanticsLoading;

  /// Screen reader label when journey data fails to load.
  ///
  /// In en, this message translates to:
  /// **'Treatment Journey, could not load treatment progress'**
  String get parentTreatmentJourneySemanticsError;

  /// Screen reader label when journey chart has no data.
  ///
  /// In en, this message translates to:
  /// **'Treatment Journey, progress will appear after exercises are reviewed'**
  String get parentTreatmentJourneySemanticsEmpty;

  /// Screen reader label when journey chart is loaded.
  ///
  /// In en, this message translates to:
  /// **'Treatment Journey, current progress {score} percent, {trend}'**
  String parentTreatmentJourneySemanticsLoaded(int score, String trend);

  /// Subtitle on the full treatment journey progress screen.
  ///
  /// In en, this message translates to:
  /// **'See how your child\'s progress has changed over time'**
  String get parentTreatmentJourneyScreenSubtitle;

  /// Weekly period tab on the treatment journey screen.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get parentTreatmentJourneyPeriodWeekly;

  /// Monthly period tab on the treatment journey screen.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get parentTreatmentJourneyPeriodMonthly;

  /// Full treatment period tab on the treatment journey screen.
  ///
  /// In en, this message translates to:
  /// **'Full Treatment'**
  String get parentTreatmentJourneyPeriodFull;

  /// Summary metric label for the starting score.
  ///
  /// In en, this message translates to:
  /// **'Started At'**
  String get parentTreatmentJourneyStartedAt;

  /// Summary metric label for the current score.
  ///
  /// In en, this message translates to:
  /// **'Current Progress'**
  String get parentTreatmentJourneyCurrentProgress;

  /// Summary metric label for score change.
  ///
  /// In en, this message translates to:
  /// **'Score Change'**
  String get parentTreatmentJourneyScoreChangeLabel;

  /// Label above the trend badge in the journey summary.
  ///
  /// In en, this message translates to:
  /// **'Trend'**
  String get parentTreatmentJourneyTrendLabel;

  /// Error banner when the full treatment journey fails to load.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load the treatment journey.'**
  String get parentTreatmentJourneyLoadFailedDefault;

  /// Label for the treatment start/end date range card.
  ///
  /// In en, this message translates to:
  /// **'Treatment period'**
  String get parentTreatmentJourneyTreatmentPeriod;

  /// Empty chart title on the treatment journey screen.
  ///
  /// In en, this message translates to:
  /// **'No treatment progress yet'**
  String get parentTreatmentJourneyChartEmptyTitle;

  /// Empty chart body on the treatment journey screen.
  ///
  /// In en, this message translates to:
  /// **'Progress will appear after completed exercises are reviewed.'**
  String get parentTreatmentJourneyChartEmptyBody;

  /// Selected chart point score label.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get parentTreatmentJourneyChartScore;

  /// Selected chart point date label.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get parentTreatmentJourneyChartDate;

  /// Selected chart point exercises label.
  ///
  /// In en, this message translates to:
  /// **'Exercises'**
  String get parentTreatmentJourneyChartExercises;

  /// Selected chart point improvement label.
  ///
  /// In en, this message translates to:
  /// **'Improvement'**
  String get parentTreatmentJourneyChartImprovement;

  /// Screen reader label when the journey chart has no data.
  ///
  /// In en, this message translates to:
  /// **'Treatment progress chart, no data yet'**
  String get parentTreatmentJourneyChartAriaEmpty;

  /// Screen reader label when the journey chart has data.
  ///
  /// In en, this message translates to:
  /// **'Treatment progress chart with {count} points'**
  String parentTreatmentJourneyChartAriaWithPoints(int count);

  /// Screen reader label for the selected chart point details.
  ///
  /// In en, this message translates to:
  /// **'Selected point score {score}, date {date}'**
  String parentTreatmentJourneyChartSelectedPointAria(
    String score,
    String date,
  );

  /// Screen reader label for a journey summary metric.
  ///
  /// In en, this message translates to:
  /// **'{label} {value}'**
  String parentTreatmentJourneySummaryMetricSemantics(
    String label,
    String value,
  );

  /// Screen reader label for a journey summary metric with trend.
  ///
  /// In en, this message translates to:
  /// **'{label} {value}, Trend {trend}'**
  String parentTreatmentJourneySummaryMetricTrendSemantics(
    String label,
    String value,
    String trend,
  );

  /// Interpretation card title when journey data is insufficient.
  ///
  /// In en, this message translates to:
  /// **'Building your journey'**
  String get parentTreatmentJourneyInterpretationBuildingTitle;

  /// Interpretation card title when only one data point exists.
  ///
  /// In en, this message translates to:
  /// **'Early progress recorded'**
  String get parentTreatmentJourneyInterpretationEarlyTitle;

  /// Interpretation card body when more data is needed.
  ///
  /// In en, this message translates to:
  /// **'More progress entries are needed to identify a trend.'**
  String get parentTreatmentJourneyInterpretationNeedMoreData;

  /// Interpretation card title for an improving trend.
  ///
  /// In en, this message translates to:
  /// **'Progress is moving upward'**
  String get parentTreatmentJourneyInterpretationImprovingTitle;

  /// Interpretation card body for an improving trend.
  ///
  /// In en, this message translates to:
  /// **'The current score is higher than the starting score.'**
  String get parentTreatmentJourneyInterpretationImprovingBody;

  /// Interpretation card title for a declining trend.
  ///
  /// In en, this message translates to:
  /// **'Progress needs attention'**
  String get parentTreatmentJourneyInterpretationDecliningTitle;

  /// Interpretation card body for a declining trend.
  ///
  /// In en, this message translates to:
  /// **'The latest score is lower than the previous period. Review recent feedback or contact the specialist.'**
  String get parentTreatmentJourneyInterpretationDecliningBody;

  /// Interpretation card title for a stable trend.
  ///
  /// In en, this message translates to:
  /// **'Progress is currently stable'**
  String get parentTreatmentJourneyInterpretationStableTitle;

  /// Interpretation card body for a stable trend.
  ///
  /// In en, this message translates to:
  /// **'Recent scores are staying within a similar range.'**
  String get parentTreatmentJourneyInterpretationStableBody;

  /// Section header for detailed progress lists.
  ///
  /// In en, this message translates to:
  /// **'Detailed Progress'**
  String get parentProgressDetailedTitle;

  /// Loading state for detailed progress lists.
  ///
  /// In en, this message translates to:
  /// **'Loading detailed progress...'**
  String get parentProgressDetailedLoading;

  /// Error message when detailed progress lists fail to load.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load detailed progress lists.'**
  String get parentProgressDetailedLoadError;

  /// Empty state when no detailed progress data exists yet.
  ///
  /// In en, this message translates to:
  /// **'More progress details will appear as therapy sessions continue.'**
  String get parentProgressDetailedEmpty;

  /// Daily progress list section title.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get parentProgressPeriodDaily;

  /// Weekly progress list section title.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get parentProgressPeriodWeekly;

  /// Monthly progress list section title.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get parentProgressPeriodMonthly;

  /// Section header for aggregate performance metrics.
  ///
  /// In en, this message translates to:
  /// **'Performance Metrics'**
  String get parentProgressPerformanceMetricsTitle;

  /// Performance metric label for total completed exercises.
  ///
  /// In en, this message translates to:
  /// **'Completed exercises'**
  String get parentProgressCompletedExercisesLabel;

  /// Performance metric label for average performance.
  ///
  /// In en, this message translates to:
  /// **'Average performance'**
  String get parentProgressAveragePerformance;

  /// Performance metric label for average improvement.
  ///
  /// In en, this message translates to:
  /// **'Average improvement'**
  String get parentProgressAverageImprovement;

  /// Progress snapshot detail for completed exercise count.
  ///
  /// In en, this message translates to:
  /// **'{count} completed'**
  String parentProgressSnapshotCompleted(int count);

  /// Progress snapshot detail for improvement percentage.
  ///
  /// In en, this message translates to:
  /// **'{percent}% improvement'**
  String parentProgressSnapshotImprovement(int percent);

  /// Progress snapshot detail for performance percentage.
  ///
  /// In en, this message translates to:
  /// **'{percent}% performance'**
  String parentProgressSnapshotPerformance(int percent);

  /// Loading state for the case intake section.
  ///
  /// In en, this message translates to:
  /// **'Loading case requests...'**
  String get parentDashboardCaseIntakeLoading;

  /// Onboarding title for new parents without a linked child.
  ///
  /// In en, this message translates to:
  /// **'Start Your Child\'s Follow-Up Journey'**
  String get parentDashboardCaseIntakeTitle;

  /// Onboarding description for case intake.
  ///
  /// In en, this message translates to:
  /// **'Tell us about the observed condition. The admin team will review the request and assign a suitable specialist.'**
  String get parentDashboardCaseIntakeDescription;

  /// Medical disclaimer on the case intake onboarding card.
  ///
  /// In en, this message translates to:
  /// **'The selected category is preliminary and does not represent a medical diagnosis.'**
  String get parentDashboardCaseIntakeDisclaimer;

  /// Primary action to start a new case request.
  ///
  /// In en, this message translates to:
  /// **'Submit New Case Request'**
  String get parentDashboardCaseIntakeSubmitNew;

  /// Secondary action to browse existing case requests.
  ///
  /// In en, this message translates to:
  /// **'View Case Requests'**
  String get parentDashboardCaseIntakeViewRequests;

  /// Title for an active featured case request card.
  ///
  /// In en, this message translates to:
  /// **'Case Request'**
  String get parentDashboardCaseRequest;

  /// Hint when conversation is not yet available.
  ///
  /// In en, this message translates to:
  /// **'Conversation becomes available after specialist assignment.'**
  String get parentDashboardCaseConversationPending;

  /// Button to open case request details.
  ///
  /// In en, this message translates to:
  /// **'View Request'**
  String get parentDashboardCaseViewRequest;

  /// Button to open the case conversation.
  ///
  /// In en, this message translates to:
  /// **'Open Conversation'**
  String get parentDashboardCaseOpenConversation;

  /// Button to browse all case requests.
  ///
  /// In en, this message translates to:
  /// **'View All Requests'**
  String get parentDashboardCaseViewAllRequests;

  /// Title for a rejected case request update card.
  ///
  /// In en, this message translates to:
  /// **'Case Request Update'**
  String get parentDashboardCaseUpdateTitle;

  /// Button to submit a new request after rejection.
  ///
  /// In en, this message translates to:
  /// **'Submit Another Request'**
  String get parentDashboardCaseSubmitAnother;

  /// Fallback when a rejected request has no reason.
  ///
  /// In en, this message translates to:
  /// **'No rejection reason was provided.'**
  String get parentDashboardCaseNoRejectionReason;

  /// Submission date label on a case request summary.
  ///
  /// In en, this message translates to:
  /// **'Submitted {date}'**
  String parentDashboardCaseSubmittedOn(String date);

  /// Button to open the parent profile editor.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get parentProfileEditProfile;

  /// Section heading for personal fields on the edit profile form.
  ///
  /// In en, this message translates to:
  /// **'Personal Information'**
  String get parentProfilePersonalSection;

  /// Section heading for parent-specific profile fields.
  ///
  /// In en, this message translates to:
  /// **'Parent Details'**
  String get parentProfileParentDetails;

  /// Optional notes about the parent-child relationship.
  ///
  /// In en, this message translates to:
  /// **'Relationship Notes'**
  String get parentProfileRelationshipNotes;

  /// Primary action to persist profile edits.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get parentProfileSaveChanges;

  /// Empty state when the parent profile cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Profile not available.'**
  String get parentProfileNotAvailable;

  /// Loading state for the parent profile screen.
  ///
  /// In en, this message translates to:
  /// **'Loading profile...'**
  String get parentProfileLoading;

  /// Snack bar after a successful profile save.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get parentProfileUpdatedSuccess;

  /// Error when profile actions require authentication.
  ///
  /// In en, this message translates to:
  /// **'Not signed in'**
  String get parentProfileNotSignedIn;

  /// Validation when the full name field is empty.
  ///
  /// In en, this message translates to:
  /// **'Full name is required'**
  String get parentProfileFullNameRequired;

  /// Error when the parent profile request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load profile: {error}'**
  String parentProfileLoadFailed(String error);

  /// Error when saving the parent profile fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save profile: {error}'**
  String parentProfileSaveFailed(String error);

  /// Partial success when profile saves but photo upload fails.
  ///
  /// In en, this message translates to:
  /// **'Profile details were saved, but the image upload failed: {error}'**
  String parentProfileImageUploadFailed(String error);

  /// Profile saved but post-save refresh failed.
  ///
  /// In en, this message translates to:
  /// **'Profile saved, but refresh failed: {error}'**
  String parentProfileRefreshAfterSaveFailed(String error);

  /// Action to capture a profile photo with the camera.
  ///
  /// In en, this message translates to:
  /// **'Take Photo'**
  String get parentProfilePhotoTake;

  /// Action to pick a profile photo from the gallery.
  ///
  /// In en, this message translates to:
  /// **'Choose from Gallery'**
  String get parentProfilePhotoChooseGallery;

  /// Generic profile image upload failure.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload profile image.'**
  String get parentProfileImageUploadError;

  /// Action to mark every notification as read.
  ///
  /// In en, this message translates to:
  /// **'Mark all as read'**
  String get parentNotificationsMarkAllRead;

  /// Empty state when the notification list has no items.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet.'**
  String get parentNotificationsEmpty;

  /// Loading state for the parent notifications screen.
  ///
  /// In en, this message translates to:
  /// **'Loading notifications...'**
  String get parentNotificationsLoading;

  /// Error when notifications require authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view notifications.'**
  String get parentNotificationsSignInRequired;

  /// Error when the notifications request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load notifications: {error}'**
  String parentNotificationsLoadFailed(String error);

  /// Fallback label for a notification type when none is provided.
  ///
  /// In en, this message translates to:
  /// **'Update'**
  String get notificationTypeUpdate;

  /// App bar title for the parent linked children list screen.
  ///
  /// In en, this message translates to:
  /// **'Children'**
  String get parentChildrenScreenTitle;

  /// Empty state when the parent has no linked children.
  ///
  /// In en, this message translates to:
  /// **'No linked children yet. Add a child from the specialist portal.'**
  String get parentChildrenNoLinked;

  /// Child age label on the children list.
  ///
  /// In en, this message translates to:
  /// **'{count} yrs'**
  String parentChildrenAgeYears(int count);

  /// Inline progress percentage on a child card.
  ///
  /// In en, this message translates to:
  /// **'{percent}% progress'**
  String parentChildrenProgressPercent(int percent);

  /// Placeholder when child progress is not yet available.
  ///
  /// In en, this message translates to:
  /// **'Progress will appear once exercises are tracked.'**
  String get parentChildrenProgressPending;

  /// Loading state while child reports are fetched.
  ///
  /// In en, this message translates to:
  /// **'Loading reports...'**
  String get parentReportsLoading;

  /// Empty state when no child is selected on the reports tab.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view reports.'**
  String get parentReportsSelectChild;

  /// Empty state when a selected child has no reports.
  ///
  /// In en, this message translates to:
  /// **'No reports available for {childName}.'**
  String parentReportsEmptyForChild(String childName);

  /// Accessibility tooltip for opening a report PDF.
  ///
  /// In en, this message translates to:
  /// **'Open report'**
  String get parentReportsOpenReport;

  /// Weekly report type label.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get reportTypeWeekly;

  /// Monthly report type label.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get reportTypeMonthly;

  /// Daily report type label.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get reportTypeDaily;

  /// Progress report type label.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get reportTypeProgress;

  /// Subtitle on the exercises tab for the selected child.
  ///
  /// In en, this message translates to:
  /// **'Exercises for {childName}'**
  String parentExercisesForChild(String childName);

  /// Assigned exercises tab label.
  ///
  /// In en, this message translates to:
  /// **'Assigned'**
  String get parentExercisesTabAssigned;

  /// Loading state for the exercises tab.
  ///
  /// In en, this message translates to:
  /// **'Loading exercises...'**
  String get parentExercisesLoading;

  /// Empty state when no child is selected on the exercises tab.
  ///
  /// In en, this message translates to:
  /// **'Select a child to view exercises.'**
  String get parentExercisesSelectChild;

  /// Empty daily tasks state for a selected child.
  ///
  /// In en, this message translates to:
  /// **'No daily tasks assigned for {childName} today.'**
  String parentExercisesNoDailyForChild(String childName);

  /// Empty weekly tasks state for a selected child.
  ///
  /// In en, this message translates to:
  /// **'No weekly tasks assigned for {childName}.'**
  String parentExercisesNoWeeklyForChild(String childName);

  /// Empty assigned exercises state for a selected child.
  ///
  /// In en, this message translates to:
  /// **'No assigned exercises for {childName} yet.'**
  String parentExercisesNoAssignedForChild(String childName);

  /// Due date label on an exercise task.
  ///
  /// In en, this message translates to:
  /// **'Due {date}'**
  String parentExercisesDueDate(String date);

  /// Error when the exercises request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load exercises: {error}'**
  String parentExercisesLoadFailed(String error);

  /// Daily exercise assignment frequency.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get exerciseFrequencyDaily;

  /// Weekly exercise assignment frequency.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get exerciseFrequencyWeekly;

  /// Monthly exercise assignment frequency when returned by API.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get exerciseFrequencyMonthly;

  /// Task or exercise currently underway.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get statusInProgress;

  /// Error when the parent dashboard requires authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view the parent dashboard.'**
  String get parentDashboardSignInRequired;

  /// Error when the parent dashboard request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load dashboard: {error}'**
  String parentDashboardLoadFailed(String error);

  /// Error when selected child data fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load child data: {error}'**
  String parentDashboardChildDataLoadFailed(String error);

  /// Overview section heading on the specialist dashboard.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get specialistDashboardOverview;

  /// Summary card for active patient cases.
  ///
  /// In en, this message translates to:
  /// **'Active Cases'**
  String get specialistDashboardActiveCases;

  /// Empty state when no cases are assigned.
  ///
  /// In en, this message translates to:
  /// **'No active cases assigned yet.'**
  String get specialistDashboardNoActiveCases;

  /// Empty state for the pending reviews section.
  ///
  /// In en, this message translates to:
  /// **'No pending reviews right now.'**
  String get specialistDashboardNoPendingReviews;

  /// Section heading for patient progress list.
  ///
  /// In en, this message translates to:
  /// **'Recent Patient Progress'**
  String get specialistDashboardRecentPatientProgress;

  /// Empty state when no progress snapshots exist.
  ///
  /// In en, this message translates to:
  /// **'No progress data available yet.'**
  String get specialistDashboardNoProgressData;

  /// Error when the specialist dashboard requires authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in as a specialist to view this dashboard.'**
  String get specialistDashboardSignInRequired;

  /// Error when the specialist dashboard request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load specialist dashboard: {error}'**
  String specialistDashboardLoadFailed(String error);

  /// Title for the weekly unique patient interactions analytics card.
  ///
  /// In en, this message translates to:
  /// **'Weekly Patient Interactions'**
  String get specialistDashboardWeeklyPatientInteractions;

  /// Subtitle for the weekly unique patient interactions analytics card.
  ///
  /// In en, this message translates to:
  /// **'Unique patients you interacted with this week'**
  String get specialistDashboardWeeklyPatientInteractionsSubtitle;

  /// Weekly summary above the patient interactions chart.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 unique patient this week} other{{count} unique patients this week}}'**
  String specialistDashboardUniquePatientsThisWeek(int count);

  /// Error when weekly patient interactions fail to load.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load weekly patient interactions. Please try again.'**
  String get specialistDashboardWeeklyInteractionsLoadFailed;

  /// Empty state when a chart day has no patient interactions.
  ///
  /// In en, this message translates to:
  /// **'No patient interactions on this day.'**
  String get specialistDashboardNoInteractionsThisDay;

  /// Patient count subtitle in the daily interactions bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 patient} other{{count} patients}}'**
  String specialistDashboardInteractionPatientsCount(int count);

  /// Weekly schedule card heading.
  ///
  /// In en, this message translates to:
  /// **'THIS WEEK'**
  String get specialistDashboardThisWeek;

  /// Link to open the sessions calendar view.
  ///
  /// In en, this message translates to:
  /// **'View Calendar'**
  String get specialistDashboardViewCalendar;

  /// Heading when no next session is scheduled.
  ///
  /// In en, this message translates to:
  /// **'No upcoming sessions'**
  String get specialistDashboardNoUpcomingSessions;

  /// Hint below the no upcoming sessions heading.
  ///
  /// In en, this message translates to:
  /// **'Your scheduled sessions will appear here.'**
  String get specialistDashboardScheduledSessionsHint;

  /// Button to open the next session details.
  ///
  /// In en, this message translates to:
  /// **'View Session →'**
  String get specialistDashboardViewSession;

  /// Footer when no sessions remain today.
  ///
  /// In en, this message translates to:
  /// **'No sessions scheduled for today'**
  String get specialistDashboardNoSessionsToday;

  /// Footer when today's sessions are complete.
  ///
  /// In en, this message translates to:
  /// **'No more sessions today'**
  String get specialistDashboardNoMoreSessionsToday;

  /// Footer showing remaining sessions today.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 more session today} other{{count} more sessions today}}'**
  String specialistDashboardMoreSessionsToday(int count);

  /// Next session schedule when it is today.
  ///
  /// In en, this message translates to:
  /// **'Today, {time}'**
  String specialistDashboardNextSessionToday(String time);

  /// Next session schedule when it is tomorrow.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow, {time}'**
  String specialistDashboardNextSessionTomorrow(String time);

  /// Fallback when review submission time is unknown.
  ///
  /// In en, this message translates to:
  /// **'Recently submitted'**
  String get specialistDashboardSubmittedRecently;

  /// Review submitted within the last hour.
  ///
  /// In en, this message translates to:
  /// **'Submitted {minutes}m ago'**
  String specialistDashboardSubmittedMinutesAgo(int minutes);

  /// Review submitted within the last day.
  ///
  /// In en, this message translates to:
  /// **'Submitted {hours}h ago'**
  String specialistDashboardSubmittedHoursAgo(int hours);

  /// Review submitted on a specific date.
  ///
  /// In en, this message translates to:
  /// **'Submitted {date}'**
  String specialistDashboardSubmittedOnDate(String date);

  /// Screen title for the specialist patient progress list.
  ///
  /// In en, this message translates to:
  /// **'Patient Progress'**
  String get specialistPatientProgress;

  /// Archived record status filter label.
  ///
  /// In en, this message translates to:
  /// **'Archived'**
  String get statusArchived;

  /// Filter for upcoming items.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get filterUpcoming;

  /// Filter for past items.
  ///
  /// In en, this message translates to:
  /// **'Past'**
  String get filterPast;

  /// Filter for recently updated items.
  ///
  /// In en, this message translates to:
  /// **'Recent'**
  String get filterRecent;

  /// Filter for AI-generated reports.
  ///
  /// In en, this message translates to:
  /// **'AI Reports'**
  String get reportTypeAiReports;

  /// Short badge label for AI-generated reports.
  ///
  /// In en, this message translates to:
  /// **'AI'**
  String get reportTypeAi;

  /// Session requests tab label.
  ///
  /// In en, this message translates to:
  /// **'Requests'**
  String get entitySessionRequests;

  /// Specialist specialization field label.
  ///
  /// In en, this message translates to:
  /// **'Specialization'**
  String get fieldSpecialization;

  /// Professional license number field label.
  ///
  /// In en, this message translates to:
  /// **'License Number'**
  String get fieldLicenseNumber;

  /// Years of professional experience field label.
  ///
  /// In en, this message translates to:
  /// **'Years of Experience'**
  String get fieldYearsOfExperience;

  /// Profile biography field label.
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get fieldBio;

  /// Date field label.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get fieldDate;

  /// Time field label.
  ///
  /// In en, this message translates to:
  /// **'Time'**
  String get fieldTime;

  /// Location field label.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get fieldLocation;

  /// Indicates an item is selected.
  ///
  /// In en, this message translates to:
  /// **'Selected'**
  String get commonSelected;

  /// Copy text or link to clipboard.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get commonCopy;

  /// Open a link or file.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get commonOpen;

  /// Approve a pending request.
  ///
  /// In en, this message translates to:
  /// **'Approve'**
  String get commonApprove;

  /// Reject a pending request.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get commonReject;

  /// Action is being processed.
  ///
  /// In en, this message translates to:
  /// **'Processing...'**
  String get commonProcessing;

  /// Calendar navigation tooltip.
  ///
  /// In en, this message translates to:
  /// **'Previous month'**
  String get calendarPreviousMonth;

  /// Calendar navigation tooltip.
  ///
  /// In en, this message translates to:
  /// **'Next month'**
  String get calendarNextMonth;

  /// Generic specialist list load failure.
  ///
  /// In en, this message translates to:
  /// **'Failed to load data: {error}'**
  String specialistLoadFailed(String error);

  /// Error when patient progress fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load progress: {error}'**
  String specialistProgressLoadFailed(String error);

  /// Error when specialist reports fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load reports: {error}'**
  String specialistReportsLoadFailed(String error);

  /// Error when specialist sessions fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load sessions: {error}'**
  String specialistSessionsLoadFailed(String error);

  /// Error when session requests require authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view session requests.'**
  String get specialistSessionRequestsSignInRequired;

  /// Error when session requests fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load session requests: {error}'**
  String specialistSessionRequestsLoadFailed(String error);

  /// Action to create a new treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Add Treatment Plan'**
  String get specialistAddTreatmentPlan;

  /// Snack bar when no patients are available for plan creation.
  ///
  /// In en, this message translates to:
  /// **'No assigned patients available.'**
  String get specialistNoAssignedPatients;

  /// Bottom sheet title for choosing a patient.
  ///
  /// In en, this message translates to:
  /// **'Select patient'**
  String get specialistSelectPatient;

  /// Patient picker subtitle when a plan already exists.
  ///
  /// In en, this message translates to:
  /// **'This patient already has an active treatment plan.'**
  String get specialistPatientHasActivePlan;

  /// Patient picker subtitle when no active plan exists.
  ///
  /// In en, this message translates to:
  /// **'No active plan'**
  String get specialistNoActivePlan;

  /// Search hint on the treatment plans screen.
  ///
  /// In en, this message translates to:
  /// **'Search by plan title or patient'**
  String get specialistSearchPlansHint;

  /// Empty state when no treatment plans exist.
  ///
  /// In en, this message translates to:
  /// **'No treatment plans found.'**
  String get specialistNoTreatmentPlans;

  /// Empty state when filters hide all treatment plans.
  ///
  /// In en, this message translates to:
  /// **'No plans match your search or filter.'**
  String get specialistNoPlansMatchFilter;

  /// Action to create a new exercise.
  ///
  /// In en, this message translates to:
  /// **'Add Exercise'**
  String get specialistAddExercise;

  /// Heading on the specialist exercises screen.
  ///
  /// In en, this message translates to:
  /// **'Exercise Library'**
  String get specialistExerciseLibrary;

  /// Subtitle on the specialist exercises screen.
  ///
  /// In en, this message translates to:
  /// **'Browse therapy exercises by category and search.'**
  String get specialistExerciseLibrarySubtitle;

  /// Search hint on the exercises screen.
  ///
  /// In en, this message translates to:
  /// **'Search by title, category, or instructions'**
  String get specialistSearchExercisesHint;

  /// Empty state when the exercise library is empty.
  ///
  /// In en, this message translates to:
  /// **'No exercises available yet. New exercises will appear here once added.'**
  String get specialistNoExercises;

  /// Empty state when exercise filters hide all items.
  ///
  /// In en, this message translates to:
  /// **'No exercises match your filters.'**
  String get specialistNoExercisesMatchFilter;

  /// Indicator that an exercise includes media.
  ///
  /// In en, this message translates to:
  /// **'Includes instruction media'**
  String get specialistExerciseIncludesMedia;

  /// Reports screen title when scoped to one patient.
  ///
  /// In en, this message translates to:
  /// **'Patient Reports'**
  String get specialistPatientReports;

  /// Search hint on the reports screen.
  ///
  /// In en, this message translates to:
  /// **'Search by patient or title'**
  String get specialistSearchReportsHint;

  /// Empty state when no reports exist.
  ///
  /// In en, this message translates to:
  /// **'No reports found.'**
  String get specialistNoReports;

  /// Empty state when a patient has no reports.
  ///
  /// In en, this message translates to:
  /// **'No reports found for this patient.'**
  String get specialistNoReportsForPatient;

  /// Empty state when report filters hide all items.
  ///
  /// In en, this message translates to:
  /// **'No reports match your search or filter.'**
  String get specialistNoReportsMatchFilter;

  /// FAB label to create a new session.
  ///
  /// In en, this message translates to:
  /// **'Schedule Session'**
  String get specialistScheduleSession;

  /// Empty state when no sessions exist.
  ///
  /// In en, this message translates to:
  /// **'No sessions found.'**
  String get specialistNoSessions;

  /// Empty state when session filters hide all items.
  ///
  /// In en, this message translates to:
  /// **'No sessions match your search or filter.'**
  String get specialistNoSessionsMatchFilter;

  /// Search hint on the sessions screen.
  ///
  /// In en, this message translates to:
  /// **'Search by patient name'**
  String get specialistSearchSessionsHint;

  /// Empty state for a calendar day without sessions.
  ///
  /// In en, this message translates to:
  /// **'No sessions scheduled for this date.'**
  String get specialistNoSessionsOnDate;

  /// Empty state when no session requests exist.
  ///
  /// In en, this message translates to:
  /// **'No session requests yet.'**
  String get specialistNoSessionRequests;

  /// Empty state when no pending session requests exist.
  ///
  /// In en, this message translates to:
  /// **'No pending session requests.'**
  String get specialistNoPendingSessionRequests;

  /// Empty state when session request filters hide all items.
  ///
  /// In en, this message translates to:
  /// **'No session requests match this filter.'**
  String get specialistNoSessionRequestsMatchFilter;

  /// Label for preferred session date on a request card.
  ///
  /// In en, this message translates to:
  /// **'Preferred date'**
  String get specialistSessionRequestPreferredDate;

  /// Label for preferred session time on a request card.
  ///
  /// In en, this message translates to:
  /// **'Preferred time'**
  String get specialistSessionRequestPreferredTime;

  /// Label for when a session request was submitted.
  ///
  /// In en, this message translates to:
  /// **'Requested'**
  String get specialistSessionRequestRequested;

  /// Approved session schedule summary on a request card.
  ///
  /// In en, this message translates to:
  /// **'Scheduled: {dateTime}'**
  String specialistSessionScheduledAt(String dateTime);

  /// Approved session duration on a request card.
  ///
  /// In en, this message translates to:
  /// **'Duration: {minutes} min'**
  String specialistSessionDurationMinutes(int minutes);

  /// Session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Regular Follow-up'**
  String get specialistSessionRequestRegularFollowUp;

  /// Session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Replacement for Cancelled Session'**
  String get specialistSessionRequestReplacementCancelled;

  /// Session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Replacement for Missed Session'**
  String get specialistSessionRequestReplacementMissed;

  /// Session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Additional Session'**
  String get specialistSessionRequestAdditionalSession;

  /// Session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Consultation'**
  String get specialistSessionRequestConsultation;

  /// Session request reason label for custom reasons.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get specialistSessionRequestOther;

  /// Fallback session request reason label.
  ///
  /// In en, this message translates to:
  /// **'Session request'**
  String get specialistSessionRequestDefault;

  /// Assigned status for cases, requests, or resources.
  ///
  /// In en, this message translates to:
  /// **'Assigned'**
  String get statusAssigned;

  /// Admin dashboard greeting.
  ///
  /// In en, this message translates to:
  /// **'Welcome, {userName}'**
  String adminDashboardWelcome(String userName);

  /// Admin dashboard subtitle.
  ///
  /// In en, this message translates to:
  /// **'Manage your rehabilitation platform from one place.'**
  String get adminDashboardSubtitle;

  /// Hint on the patient assignments shortcut card.
  ///
  /// In en, this message translates to:
  /// **'Assign specialists and link parents to patients'**
  String get adminDashboardPatientAssignmentsHint;

  /// Weekly new signup delta on the users KPI card.
  ///
  /// In en, this message translates to:
  /// **'+{count} this week'**
  String adminDashboardNewSignupsThisWeek(int count);

  /// Subtitle for the new signups KPI card.
  ///
  /// In en, this message translates to:
  /// **'This week'**
  String get adminDashboardThisWeek;

  /// KPI label for specialist count.
  ///
  /// In en, this message translates to:
  /// **'Specialists'**
  String get adminDashboardSpecialists;

  /// KPI label for new signups this week.
  ///
  /// In en, this message translates to:
  /// **'New Signups'**
  String get adminDashboardNewSignups;

  /// System analytics section heading.
  ///
  /// In en, this message translates to:
  /// **'System Analytics'**
  String get adminDashboardSystemAnalytics;

  /// Recent users section heading.
  ///
  /// In en, this message translates to:
  /// **'Recent Users'**
  String get adminDashboardRecentUsers;

  /// Empty state when no users exist.
  ///
  /// In en, this message translates to:
  /// **'No users found.'**
  String get adminDashboardNoUsers;

  /// Error when admin dashboard requires authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in as an admin to view this dashboard.'**
  String get adminDashboardSignInRequired;

  /// Error when the admin dashboard request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load admin dashboard: {error}'**
  String adminDashboardLoadFailed(String error);

  /// Chart legend label for system activity.
  ///
  /// In en, this message translates to:
  /// **'System Activity'**
  String get adminSystemActivity;

  /// Empty state when weekly system activity has no events.
  ///
  /// In en, this message translates to:
  /// **'No system activity during this period.'**
  String get adminSystemActivityEmpty;

  /// Hint below empty system activity chart.
  ///
  /// In en, this message translates to:
  /// **'Try selecting another week.'**
  String get adminSystemActivityTryAnotherWeek;

  /// Accessibility tooltip for previous week navigation.
  ///
  /// In en, this message translates to:
  /// **'Previous week'**
  String get adminSystemActivityPreviousWeek;

  /// Accessibility tooltip for next week navigation.
  ///
  /// In en, this message translates to:
  /// **'Next week'**
  String get adminSystemActivityNextWeek;

  /// Accessibility tooltip for period preset menu.
  ///
  /// In en, this message translates to:
  /// **'Select period'**
  String get adminSystemActivitySelectPeriod;

  /// System activity preset label.
  ///
  /// In en, this message translates to:
  /// **'Last 2 Weeks'**
  String get adminSystemActivityLast2Weeks;

  /// System activity preset label.
  ///
  /// In en, this message translates to:
  /// **'Last Month'**
  String get adminSystemActivityLastMonth;

  /// Custom week offset label for system activity.
  ///
  /// In en, this message translates to:
  /// **'{count} weeks ago'**
  String adminSystemActivityWeeksAgo(int count);

  /// Singular event count label in chart tooltip.
  ///
  /// In en, this message translates to:
  /// **'event'**
  String get adminSystemActivityEvent;

  /// Plural event count label in chart tooltip.
  ///
  /// In en, this message translates to:
  /// **'events'**
  String get adminSystemActivityEvents;

  /// Selected day activity tooltip on the system activity chart.
  ///
  /// In en, this message translates to:
  /// **'System Activity: {count} {label}'**
  String adminSystemActivityTooltip(int count, String label);

  /// Error when weekly system activity fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load system activity. Please try again.'**
  String get adminSystemActivityLoadFailed;

  /// Search hint on the admin users screen.
  ///
  /// In en, this message translates to:
  /// **'Search by name, email, or role'**
  String get adminUsersSearchHint;

  /// Error when the admin users request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load users: {error}'**
  String adminUsersLoadFailed(String error);

  /// Confirmation dialog title for deactivating a user.
  ///
  /// In en, this message translates to:
  /// **'Deactivate User'**
  String get adminUsersDeactivateTitle;

  /// Confirmation dialog title for activating a user.
  ///
  /// In en, this message translates to:
  /// **'Activate User'**
  String get adminUsersActivateTitle;

  /// Confirmation message for deactivating a user.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to deactivate this user? They may lose access to the platform.'**
  String get adminUsersDeactivateConfirm;

  /// Confirmation message for activating a user.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to activate this user?'**
  String get adminUsersActivateConfirm;

  /// Error when toggling user active status fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update user status: {error}'**
  String adminUsersUpdateStatusFailed(String error);

  /// Snack bar after deleting a user.
  ///
  /// In en, this message translates to:
  /// **'User deleted successfully.'**
  String get adminUsersDeletedSuccess;

  /// Error when saving a user fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save user: {error}'**
  String adminUsersSaveFailed(String error);

  /// Activate a user or resource.
  ///
  /// In en, this message translates to:
  /// **'Activate'**
  String get adminActivate;

  /// Deactivate a user or resource.
  ///
  /// In en, this message translates to:
  /// **'Deactivate'**
  String get adminDeactivate;

  /// Search hint on the admin patients screen.
  ///
  /// In en, this message translates to:
  /// **'Search patients or condition'**
  String get adminPatientsSearchHint;

  /// Condition filter label on the admin patients screen.
  ///
  /// In en, this message translates to:
  /// **'Filter by condition'**
  String get adminPatientsFilterCondition;

  /// Condition filter option for all conditions.
  ///
  /// In en, this message translates to:
  /// **'All conditions'**
  String get adminPatientsAllConditions;

  /// Empty state when no patients exist.
  ///
  /// In en, this message translates to:
  /// **'No patients found.'**
  String get adminPatientsNoPatients;

  /// Error when the admin patients request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load patients: {error}'**
  String adminPatientsLoadFailed(String error);

  /// Tooltip for editing a patient from the list.
  ///
  /// In en, this message translates to:
  /// **'Edit Patient'**
  String get adminPatientsEditPatient;

  /// Label for the previous session section on a patient card.
  ///
  /// In en, this message translates to:
  /// **'Previous Session'**
  String get adminPatientsPreviousSession;

  /// Empty previous session label on a patient card.
  ///
  /// In en, this message translates to:
  /// **'No previous session'**
  String get adminPatientsNoPreviousSession;

  /// Fallback when a session date is missing.
  ///
  /// In en, this message translates to:
  /// **'Unknown date'**
  String get adminPatientsUnknownDate;

  /// Search hint on the admin sessions screen.
  ///
  /// In en, this message translates to:
  /// **'Search patient or specialist'**
  String get adminSessionsSearchHint;

  /// Status filter label on the admin sessions screen.
  ///
  /// In en, this message translates to:
  /// **'Filter by status'**
  String get adminSessionsFilterStatus;

  /// Status filter option for all session statuses.
  ///
  /// In en, this message translates to:
  /// **'All statuses'**
  String get adminSessionsAllStatuses;

  /// Empty state when no sessions exist.
  ///
  /// In en, this message translates to:
  /// **'No sessions found.'**
  String get adminSessionsNoSessions;

  /// Error when the admin sessions request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load sessions: {error}'**
  String adminSessionsLoadFailed(String error);

  /// Specialist name label on a session card.
  ///
  /// In en, this message translates to:
  /// **'Specialist: {name}'**
  String adminSessionsSpecialistLabel(String name);

  /// Session duration label on a session card.
  ///
  /// In en, this message translates to:
  /// **'Duration: {minutes} min'**
  String adminSessionsDurationMinutes(int minutes);

  /// Dialog title for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Complete Session'**
  String get adminSessionsCompleteTitle;

  /// Dialog message for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to mark this session as completed?'**
  String get adminSessionsCompleteMessage;

  /// Confirm button for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Complete'**
  String get adminSessionsCompleteConfirm;

  /// Snack bar after completing a session.
  ///
  /// In en, this message translates to:
  /// **'Session marked as completed.'**
  String get adminSessionsCompleteSuccess;

  /// Dialog title for cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Cancel Session'**
  String get adminSessionsCancelTitle;

  /// Dialog message for cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to cancel this session?'**
  String get adminSessionsCancelMessage;

  /// Confirm button for cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Cancel Session'**
  String get adminSessionsCancelConfirm;

  /// Snack bar after cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Session cancelled.'**
  String get adminSessionsCancelSuccess;

  /// Dialog title for marking a session as no show.
  ///
  /// In en, this message translates to:
  /// **'Mark as No Show'**
  String get adminSessionsNoShowTitle;

  /// Dialog message for marking a session as no show.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to mark this session as no show?'**
  String get adminSessionsNoShowMessage;

  /// Confirm button for marking a session as no show.
  ///
  /// In en, this message translates to:
  /// **'Mark No Show'**
  String get adminSessionsNoShowConfirm;

  /// Snack bar after marking a session as no show.
  ///
  /// In en, this message translates to:
  /// **'Session marked as no-show.'**
  String get adminSessionsNoShowSuccess;

  /// Error when updating a session fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update session: {error}'**
  String adminSessionsUpdateFailed(String error);

  /// Error when the AI Center request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load AI Center: {error}'**
  String adminAiLoadFailed(String error);

  /// AI Center insights section title.
  ///
  /// In en, this message translates to:
  /// **'AI Insights'**
  String get adminAiInsights;

  /// AI Center insights section subtitle.
  ///
  /// In en, this message translates to:
  /// **'Speech analysis, recommendations, and clinical reports'**
  String get adminAiInsightsSubtitle;

  /// Metric label for speech analyses count.
  ///
  /// In en, this message translates to:
  /// **'Speech Analyses'**
  String get adminAiSpeechAnalyses;

  /// Average speech score subtitle.
  ///
  /// In en, this message translates to:
  /// **'Avg score {score}'**
  String adminAiAvgScore(String score);

  /// Metric label for AI recommendations count.
  ///
  /// In en, this message translates to:
  /// **'AI Recommendations'**
  String get adminAiRecommendations;

  /// Metric label for patients needing attention.
  ///
  /// In en, this message translates to:
  /// **'Needs Attention'**
  String get adminAiNeedsAttention;

  /// Pending reviews subtitle on the needs attention metric.
  ///
  /// In en, this message translates to:
  /// **'{count} pending reviews'**
  String adminAiPendingReviews(int count);

  /// Section heading for patients flagged with low scores.
  ///
  /// In en, this message translates to:
  /// **'Patients Needing Attention'**
  String get adminAiPatientsNeedingAttention;

  /// Empty state when no patients need attention.
  ///
  /// In en, this message translates to:
  /// **'No patients currently need attention.'**
  String get adminAiNoPatientsFlagged;

  /// Section heading for latest speech analyses.
  ///
  /// In en, this message translates to:
  /// **'Latest Speech Analyses'**
  String get adminAiLatestSpeechAnalyses;

  /// Section heading for latest AI recommendations.
  ///
  /// In en, this message translates to:
  /// **'Latest AI Recommendations'**
  String get adminAiLatestRecommendations;

  /// Section heading for latest AI reports.
  ///
  /// In en, this message translates to:
  /// **'Latest AI Reports'**
  String get adminAiLatestReports;

  /// Empty state for AI Center record lists.
  ///
  /// In en, this message translates to:
  /// **'No records yet.'**
  String get adminAiNoRecords;

  /// Speech score label on a patient attention card.
  ///
  /// In en, this message translates to:
  /// **'Speech {score}'**
  String adminAiSpeechScore(String score);

  /// Error when audit logs fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load audit logs: {error}'**
  String adminAuditLoadFailed(String error);

  /// Audit log user filter label.
  ///
  /// In en, this message translates to:
  /// **'Filter by user'**
  String get adminAuditFilterByUser;

  /// Audit log filter option for all users.
  ///
  /// In en, this message translates to:
  /// **'All users'**
  String get adminAuditAllUsers;

  /// Audit log action filter label.
  ///
  /// In en, this message translates to:
  /// **'Filter by action'**
  String get adminAuditFilterByAction;

  /// Audit log filter option for all actions.
  ///
  /// In en, this message translates to:
  /// **'All actions'**
  String get adminAuditAllActions;

  /// Audit log entity filter label.
  ///
  /// In en, this message translates to:
  /// **'Filter by entity'**
  String get adminAuditFilterByEntity;

  /// Audit log filter option for all entities.
  ///
  /// In en, this message translates to:
  /// **'All entities'**
  String get adminAuditAllEntities;

  /// Date range start button label.
  ///
  /// In en, this message translates to:
  /// **'From date'**
  String get adminAuditFromDate;

  /// Date range end button label.
  ///
  /// In en, this message translates to:
  /// **'To date'**
  String get adminAuditToDate;

  /// Selected start date button label.
  ///
  /// In en, this message translates to:
  /// **'From {date}'**
  String adminAuditFromDateValue(String date);

  /// Selected end date button label.
  ///
  /// In en, this message translates to:
  /// **'To {date}'**
  String adminAuditToDateValue(String date);

  /// Empty state when no audit logs match filters.
  ///
  /// In en, this message translates to:
  /// **'No audit logs found.'**
  String get adminAuditNoLogs;

  /// Dialog title for unlinking a specialist.
  ///
  /// In en, this message translates to:
  /// **'Unlink Specialist'**
  String get adminAssignmentsUnlinkSpecialist;

  /// Dialog title for unlinking a parent.
  ///
  /// In en, this message translates to:
  /// **'Unlink Parent'**
  String get adminAssignmentsUnlinkParent;

  /// Confirmation message for unlinking a specialist.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to unlink {name} from this patient?'**
  String adminAssignmentsUnlinkSpecialistConfirm(String name);

  /// Confirmation message for unlinking a parent.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to unlink {name} from this patient?'**
  String adminAssignmentsUnlinkParentConfirm(String name);

  /// Snack bar after unlinking a specialist.
  ///
  /// In en, this message translates to:
  /// **'Specialist unlinked successfully.'**
  String get adminAssignmentsSpecialistUnlinked;

  /// Snack bar after unlinking a parent.
  ///
  /// In en, this message translates to:
  /// **'Parent unlinked successfully.'**
  String get adminAssignmentsParentUnlinked;

  /// Section heading for assigning a specialist.
  ///
  /// In en, this message translates to:
  /// **'Assign Specialist'**
  String get adminAssignmentsAssignSpecialist;

  /// Section heading for linking a parent.
  ///
  /// In en, this message translates to:
  /// **'Link Parent'**
  String get adminAssignmentsLinkParent;

  /// Checkbox label for primary specialist assignment.
  ///
  /// In en, this message translates to:
  /// **'Primary specialist'**
  String get adminAssignmentsPrimarySpecialist;

  /// Submit button for specialist assignment.
  ///
  /// In en, this message translates to:
  /// **'Assign Specialist to Patient'**
  String get adminAssignmentsAssignSpecialistAction;

  /// Submit button for parent linking.
  ///
  /// In en, this message translates to:
  /// **'Link Parent to Patient'**
  String get adminAssignmentsLinkParentAction;

  /// Hint explaining how to change assignments.
  ///
  /// In en, this message translates to:
  /// **'To change an assignment, unlink the current specialist or parent, then assign or link the new one.'**
  String get adminAssignmentsChangeHint;

  /// Section heading for assigned specialists list.
  ///
  /// In en, this message translates to:
  /// **'Assigned Specialists'**
  String get adminAssignmentsAssignedSpecialists;

  /// Section heading for linked parents list.
  ///
  /// In en, this message translates to:
  /// **'Linked Parents'**
  String get adminAssignmentsLinkedParents;

  /// Loading state for assignment relationships.
  ///
  /// In en, this message translates to:
  /// **'Loading relationships...'**
  String get adminAssignmentsLoadingRelationships;

  /// Empty state when no patient is selected.
  ///
  /// In en, this message translates to:
  /// **'Select a patient to view assignments.'**
  String get adminAssignmentsSelectPatient;

  /// Empty state when a patient has no assigned specialists.
  ///
  /// In en, this message translates to:
  /// **'No specialists assigned to this patient yet.'**
  String get adminAssignmentsNoSpecialistsAssigned;

  /// Empty state when a patient has no linked parents.
  ///
  /// In en, this message translates to:
  /// **'No parents linked to this patient yet.'**
  String get adminAssignmentsNoParentsLinked;

  /// Empty dropdown hint when no patients exist.
  ///
  /// In en, this message translates to:
  /// **'No patients available'**
  String get adminAssignmentsNoPatients;

  /// Empty dropdown hint when no specialists exist.
  ///
  /// In en, this message translates to:
  /// **'No specialists available'**
  String get adminAssignmentsNoSpecialists;

  /// Empty dropdown hint when no parent accounts exist.
  ///
  /// In en, this message translates to:
  /// **'No parent accounts available'**
  String get adminAssignmentsNoParents;

  /// Relationship dropdown label.
  ///
  /// In en, this message translates to:
  /// **'Relationship'**
  String get adminAssignmentsRelationship;

  /// Empty relationship dropdown hint.
  ///
  /// In en, this message translates to:
  /// **'Select relationship'**
  String get adminAssignmentsSelectRelationship;

  /// Checkbox label for primary parent contact.
  ///
  /// In en, this message translates to:
  /// **'Primary contact'**
  String get adminAssignmentsPrimaryContact;

  /// Tooltip for unlinking a specialist.
  ///
  /// In en, this message translates to:
  /// **'Unlink specialist'**
  String get adminAssignmentsUnlinkSpecialistTooltip;

  /// Tooltip for unlinking a parent.
  ///
  /// In en, this message translates to:
  /// **'Unlink parent'**
  String get adminAssignmentsUnlinkParentTooltip;

  /// Fallback relationship label.
  ///
  /// In en, this message translates to:
  /// **'Guardian'**
  String get adminAssignmentsGuardian;

  /// Unlink action button label.
  ///
  /// In en, this message translates to:
  /// **'Unlink'**
  String get adminUnlink;

  /// Intro text on the admin case requests inbox.
  ///
  /// In en, this message translates to:
  /// **'Review preliminary child case requests and track their current status.'**
  String get adminCaseRequestsDescription;

  /// Search field label on the case requests inbox.
  ///
  /// In en, this message translates to:
  /// **'Search by child name'**
  String get adminCaseRequestsSearchLabel;

  /// Search field hint on the case requests inbox.
  ///
  /// In en, this message translates to:
  /// **'Enter child name'**
  String get adminCaseRequestsSearchHint;

  /// Tooltip for clearing case request search.
  ///
  /// In en, this message translates to:
  /// **'Clear search'**
  String get adminCaseRequestsClearSearch;

  /// Button to clear case request filters.
  ///
  /// In en, this message translates to:
  /// **'Clear Filters'**
  String get adminCaseRequestsClearFilters;

  /// Empty state when filters hide all case requests.
  ///
  /// In en, this message translates to:
  /// **'No requests match the selected filters.'**
  String get adminCaseRequestsNoMatch;

  /// Empty state when no case requests exist.
  ///
  /// In en, this message translates to:
  /// **'No case requests found.'**
  String get adminCaseRequestsEmpty;

  /// Status filter option for all case request statuses.
  ///
  /// In en, this message translates to:
  /// **'All Statuses'**
  String get adminCaseRequestsAllStatuses;

  /// Category filter option for all case categories.
  ///
  /// In en, this message translates to:
  /// **'All Categories'**
  String get adminCaseRequestsAllCategories;

  /// Case request status when converted to a patient profile.
  ///
  /// In en, this message translates to:
  /// **'Converted to Patient'**
  String get adminCaseRequestsConvertedToPatient;

  /// Tooltip for clearing active filters.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get adminClearFilters;

  /// Generic status field label.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get adminFieldStatus;

  /// Generic category field label.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get adminFieldCategory;

  /// Snack bar after a successful profile photo upload.
  ///
  /// In en, this message translates to:
  /// **'Profile photo updated successfully.'**
  String get adminProfilePhotoUpdated;

  /// Fallback title for an AI Center list item.
  ///
  /// In en, this message translates to:
  /// **'Record'**
  String get adminRecordFallback;

  /// Shown while opening a conversation or linked screen.
  ///
  /// In en, this message translates to:
  /// **'Opening...'**
  String get commonOpening;

  /// Exercise submission has been reviewed.
  ///
  /// In en, this message translates to:
  /// **'Reviewed'**
  String get statusReviewed;

  /// Exercise submission needs another attempt.
  ///
  /// In en, this message translates to:
  /// **'Needs retry'**
  String get statusNeedsRetry;

  /// Short-term treatment goal label.
  ///
  /// In en, this message translates to:
  /// **'Short-term'**
  String get goalTermShortTerm;

  /// Long-term treatment goal label.
  ///
  /// In en, this message translates to:
  /// **'Long-term'**
  String get goalTermLongTerm;

  /// Audio media type label.
  ///
  /// In en, this message translates to:
  /// **'Audio'**
  String get mediaTypeAudio;

  /// Video media type label.
  ///
  /// In en, this message translates to:
  /// **'Video'**
  String get mediaTypeVideo;

  /// Image media type label.
  ///
  /// In en, this message translates to:
  /// **'Image'**
  String get mediaTypeImage;

  /// Fallback app bar title on the specialist patient details screen.
  ///
  /// In en, this message translates to:
  /// **'Patient Details'**
  String get specialistPatientDetailsTitle;

  /// Snack bar after saving a specialist note.
  ///
  /// In en, this message translates to:
  /// **'Note saved'**
  String get specialistPatientDetailsNoteSaved;

  /// Snack bar when messaging a parent without a linked account.
  ///
  /// In en, this message translates to:
  /// **'No parent is linked to this patient yet.'**
  String get specialistPatientDetailsNoParentLinked;

  /// Snack bar when assign exercise is blocked without an active plan.
  ///
  /// In en, this message translates to:
  /// **'An active treatment plan is required before assigning an exercise.'**
  String get specialistPatientDetailsActivePlanRequired;

  /// Empty state when patient details cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Patient not found.'**
  String get specialistPatientDetailsNotFound;

  /// Snack bar when edit treatment plan is unavailable.
  ///
  /// In en, this message translates to:
  /// **'No treatment plan found for this patient.'**
  String get specialistPatientDetailsNoTreatmentPlan;

  /// Error when patient details fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load patient details: {error}'**
  String specialistPatientDetailsLoadFailed(String error);

  /// Error when saving a specialist note fails with details.
  ///
  /// In en, this message translates to:
  /// **'Failed to save note: {error}'**
  String specialistPatientDetailsSaveNoteFailed(String error);

  /// Generic error when saving a specialist note fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save note'**
  String get specialistPatientDetailsSaveNoteFailedGeneric;

  /// Error when updating patient profile fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update patient'**
  String get specialistPatientDetailsUpdateFailed;

  /// Section heading for patient quick stats grid.
  ///
  /// In en, this message translates to:
  /// **'Quick Statistics'**
  String get specialistPatientDetailsQuickStatistics;

  /// Snack bar when goals section scroll target is missing.
  ///
  /// In en, this message translates to:
  /// **'Goals section is not available yet. Pull to refresh and try again.'**
  String get specialistPatientDetailsGoalsSectionUnavailable;

  /// Snack bar when assigned exercises section scroll target is missing.
  ///
  /// In en, this message translates to:
  /// **'Assigned Exercises section is not available yet. Pull to refresh and try again.'**
  String get specialistPatientDetailsAssignedExercisesSectionUnavailable;

  /// Snack bar when submissions section scroll target is missing.
  ///
  /// In en, this message translates to:
  /// **'Submissions section is not available yet. Pull to refresh and try again.'**
  String get specialistPatientDetailsSubmissionsSectionUnavailable;

  /// Snack bar when reports navigation is unavailable.
  ///
  /// In en, this message translates to:
  /// **'Reports are unavailable right now.'**
  String get specialistPatientDetailsReportsUnavailable;

  /// Empty state when patient has no treatment plan.
  ///
  /// In en, this message translates to:
  /// **'No treatment plan assigned yet.'**
  String get specialistPatientDetailsNoTreatmentPlanYet;

  /// Empty state when patient has no goals.
  ///
  /// In en, this message translates to:
  /// **'No goals defined for this patient.'**
  String get specialistPatientDetailsNoGoals;

  /// Empty state when patient has no assigned exercises.
  ///
  /// In en, this message translates to:
  /// **'No exercises assigned yet.'**
  String get specialistPatientDetailsNoExercises;

  /// Section heading for recent exercise submissions.
  ///
  /// In en, this message translates to:
  /// **'Recent Exercise Submissions'**
  String get specialistPatientDetailsRecentSubmissions;

  /// Empty state when patient has no submissions.
  ///
  /// In en, this message translates to:
  /// **'No exercise submissions yet.'**
  String get specialistPatientDetailsNoSubmissions;

  /// Section heading for specialist notes.
  ///
  /// In en, this message translates to:
  /// **'Latest Specialist Notes'**
  String get specialistPatientDetailsLatestNotes;

  /// Empty state when patient has no specialist notes.
  ///
  /// In en, this message translates to:
  /// **'No specialist notes yet.'**
  String get specialistPatientDetailsNoNotes;

  /// Quick stat label for active goals count.
  ///
  /// In en, this message translates to:
  /// **'Active Goals'**
  String get specialistPatientDetailsActiveGoals;

  /// Section heading and quick stat label for assigned exercises.
  ///
  /// In en, this message translates to:
  /// **'Assigned Exercises'**
  String get specialistPatientDetailsAssignedExercises;

  /// Patient header subtitle with age and diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Age {age} • {diagnosis}'**
  String specialistPatientDetailsAgeDiagnosis(String age, String diagnosis);

  /// Fallback when patient has no recorded diagnosis.
  ///
  /// In en, this message translates to:
  /// **'No diagnosis recorded'**
  String get specialistPatientDetailsNoDiagnosis;

  /// Treatment plan start date label.
  ///
  /// In en, this message translates to:
  /// **'Start date'**
  String get specialistPatientDetailsStartDate;

  /// Treatment plan end date label.
  ///
  /// In en, this message translates to:
  /// **'End date'**
  String get specialistPatientDetailsEndDate;

  /// Badge when a treatment goal is achieved.
  ///
  /// In en, this message translates to:
  /// **'Achieved'**
  String get specialistPatientDetailsAchieved;

  /// Goal target value label.
  ///
  /// In en, this message translates to:
  /// **'Target value: {value}'**
  String specialistPatientDetailsTargetValue(String value);

  /// Goal target date label.
  ///
  /// In en, this message translates to:
  /// **'Target date: {date}'**
  String specialistPatientDetailsTargetDate(String date);

  /// Goal completion percentage label.
  ///
  /// In en, this message translates to:
  /// **'{percent}% complete'**
  String specialistPatientDetailsPercentComplete(int percent);

  /// Fallback when an assigned exercise has no due date.
  ///
  /// In en, this message translates to:
  /// **'No due date'**
  String get specialistPatientDetailsNoDueDate;

  /// Hint text in the add specialist note dialog.
  ///
  /// In en, this message translates to:
  /// **'Enter clinical note...'**
  String get specialistPatientDetailsEnterClinicalNote;

  /// Section heading for diagnosis management on patient details.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis / Condition'**
  String get specialistPatientDetailsDiagnosisSectionTitle;

  /// Label for the latest patient diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Current Diagnosis'**
  String get specialistPatientDetailsCurrentDiagnosis;

  /// Heading for previous diagnoses list.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis History'**
  String get specialistPatientDetailsDiagnosisHistory;

  /// Primary action to manage patient diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Manage Diagnosis'**
  String get specialistPatientDetailsManageDiagnosis;

  /// Dialog title for managing diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Manage Diagnosis'**
  String get specialistPatientDetailsManageDiagnosisTitle;

  /// Label for diagnosis selector field.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis / Condition'**
  String get specialistPatientDetailsDiagnosisSelectorLabel;

  /// Placeholder for diagnosis dropdown.
  ///
  /// In en, this message translates to:
  /// **'Select diagnosis'**
  String get specialistPatientDetailsSelectDiagnosis;

  /// Other option in diagnosis selector.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get specialistPatientDetailsDiagnosisOptionOther;

  /// Label for custom diagnosis when Other is selected.
  ///
  /// In en, this message translates to:
  /// **'Other Diagnosis'**
  String get specialistPatientDetailsOtherDiagnosisLabel;

  /// Validation when no diagnosis option is selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a diagnosis.'**
  String get specialistPatientDetailsDiagnosisSelectRequired;

  /// Validation when Other is selected without custom text.
  ///
  /// In en, this message translates to:
  /// **'Please enter the diagnosis.'**
  String get specialistPatientDetailsOtherDiagnosisRequired;

  /// No description provided for @specialistDiagnosisOptionSpeechDelay.
  ///
  /// In en, this message translates to:
  /// **'Speech Delay'**
  String get specialistDiagnosisOptionSpeechDelay;

  /// No description provided for @specialistDiagnosisOptionSpeechLanguageDelay.
  ///
  /// In en, this message translates to:
  /// **'Speech and Language Delay'**
  String get specialistDiagnosisOptionSpeechLanguageDelay;

  /// No description provided for @specialistDiagnosisOptionLanguageDelay.
  ///
  /// In en, this message translates to:
  /// **'Language Delay'**
  String get specialistDiagnosisOptionLanguageDelay;

  /// No description provided for @specialistDiagnosisOptionArticulationDisorder.
  ///
  /// In en, this message translates to:
  /// **'Articulation Disorder'**
  String get specialistDiagnosisOptionArticulationDisorder;

  /// No description provided for @specialistDiagnosisOptionFluencyDisorder.
  ///
  /// In en, this message translates to:
  /// **'Fluency Disorder'**
  String get specialistDiagnosisOptionFluencyDisorder;

  /// No description provided for @specialistDiagnosisOptionVoiceDisorder.
  ///
  /// In en, this message translates to:
  /// **'Voice Disorder'**
  String get specialistDiagnosisOptionVoiceDisorder;

  /// No description provided for @specialistDiagnosisOptionAutismSpectrumDisorder.
  ///
  /// In en, this message translates to:
  /// **'Autism Spectrum Disorder'**
  String get specialistDiagnosisOptionAutismSpectrumDisorder;

  /// No description provided for @specialistDiagnosisOptionDevelopmentalDelay.
  ///
  /// In en, this message translates to:
  /// **'Developmental Delay'**
  String get specialistDiagnosisOptionDevelopmentalDelay;

  /// No description provided for @specialistDiagnosisOptionLearningDifficulty.
  ///
  /// In en, this message translates to:
  /// **'Learning Difficulty'**
  String get specialistDiagnosisOptionLearningDifficulty;

  /// No description provided for @specialistDiagnosisOptionMotorDelay.
  ///
  /// In en, this message translates to:
  /// **'Motor Delay'**
  String get specialistDiagnosisOptionMotorDelay;

  /// No description provided for @specialistDiagnosisOptionAdhd.
  ///
  /// In en, this message translates to:
  /// **'ADHD'**
  String get specialistDiagnosisOptionAdhd;

  /// Form label for diagnosis title.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis Title'**
  String get specialistPatientDetailsDiagnosisTitleLabel;

  /// Form label for optional diagnosis description.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get specialistPatientDetailsDiagnosisDescriptionLabel;

  /// Form label for diagnosis date.
  ///
  /// In en, this message translates to:
  /// **'Diagnosed Date'**
  String get specialistPatientDetailsDiagnosedDateLabel;

  /// Validation when diagnosis title is empty.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis title is required'**
  String get specialistPatientDetailsDiagnosisTitleRequired;

  /// Snack bar after saving a diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis saved'**
  String get specialistPatientDetailsDiagnosisSaved;

  /// Error when saving diagnosis fails with details.
  ///
  /// In en, this message translates to:
  /// **'Failed to save diagnosis: {error}'**
  String specialistPatientDetailsSaveDiagnosisFailed(String error);

  /// Generic error when saving diagnosis fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save diagnosis'**
  String get specialistPatientDetailsSaveDiagnosisFailedGeneric;

  /// Label showing when a diagnosis was recorded.
  ///
  /// In en, this message translates to:
  /// **'Diagnosed: {date}'**
  String specialistPatientDetailsDiagnosedOn(String date);

  /// Label showing who recorded the diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Diagnosed by: {name}'**
  String specialistPatientDetailsDiagnosedBy(String name);

  /// Action to review patient exercise submissions.
  ///
  /// In en, this message translates to:
  /// **'Review Exercises'**
  String get specialistReviewExercises;

  /// Action and dialog title to add a specialist note.
  ///
  /// In en, this message translates to:
  /// **'Add Specialist Note'**
  String get specialistAddSpecialistNote;

  /// Action to open patient reports.
  ///
  /// In en, this message translates to:
  /// **'View Reports'**
  String get specialistViewReports;

  /// Action to edit an existing treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Edit Treatment Plan'**
  String get specialistEditTreatmentPlan;

  /// Action to create a new treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Create Treatment Plan'**
  String get specialistCreateTreatmentPlan;

  /// Action to manage patient treatment goals.
  ///
  /// In en, this message translates to:
  /// **'Manage Goals'**
  String get specialistManageGoals;

  /// Action to assign an exercise to a patient.
  ///
  /// In en, this message translates to:
  /// **'Assign Exercise'**
  String get specialistAssignExercise;

  /// Action to open a conversation with the patient's parent.
  ///
  /// In en, this message translates to:
  /// **'Message Parent'**
  String get specialistMessageParent;

  /// Title for the family pattern insight card.
  ///
  /// In en, this message translates to:
  /// **'Family Pattern Insight'**
  String get specialistFamilyPatternInsightTitle;

  /// Loading state for family pattern insight.
  ///
  /// In en, this message translates to:
  /// **'Loading family pattern insight…'**
  String get specialistFamilyPatternLoading;

  /// Retry card message when family pattern insight fails to load.
  ///
  /// In en, this message translates to:
  /// **'Family pattern insight is unavailable right now.'**
  String get specialistFamilyPatternUnavailable;

  /// Neutral message when no family patterns are found.
  ///
  /// In en, this message translates to:
  /// **'No repeated clinical characteristics were detected in the available records.'**
  String get specialistFamilyPatternNoPatternsDetected;

  /// Heading above the AI-generated family pattern summary box.
  ///
  /// In en, this message translates to:
  /// **'Clinical Summary'**
  String get specialistFamilyPatternClinicalSummary;

  /// Label for the family pattern score meter.
  ///
  /// In en, this message translates to:
  /// **'Pattern Score'**
  String get specialistFamilyPatternPatternScore;

  /// Accessibility label for the family pattern score meter.
  ///
  /// In en, this message translates to:
  /// **'Pattern score {score} out of 100. {caption}'**
  String specialistFamilyPatternScoreSemantics(int score, String caption);

  /// Caption for high family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'High confidence based on available records.'**
  String get specialistFamilyPatternScoreCaptionHigh;

  /// Caption for moderate family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'Moderate repeated characteristics detected.'**
  String get specialistFamilyPatternScoreCaptionModerate;

  /// Caption for low family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'Limited repeated characteristics detected.'**
  String get specialistFamilyPatternScoreCaptionLow;

  /// Badge for high family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'High Evidence'**
  String get specialistFamilyPatternEvidenceHigh;

  /// Badge for moderate family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'Moderate Evidence'**
  String get specialistFamilyPatternEvidenceModerate;

  /// Badge for low family pattern evidence.
  ///
  /// In en, this message translates to:
  /// **'Low Evidence'**
  String get specialistFamilyPatternEvidenceLow;

  /// Accessibility label for high evidence badge.
  ///
  /// In en, this message translates to:
  /// **'High evidence of repeated characteristics'**
  String get specialistFamilyPatternEvidenceSemanticHigh;

  /// Accessibility label for moderate evidence badge.
  ///
  /// In en, this message translates to:
  /// **'Moderate evidence of repeated characteristics'**
  String get specialistFamilyPatternEvidenceSemanticModerate;

  /// Accessibility label for low evidence badge.
  ///
  /// In en, this message translates to:
  /// **'Low evidence of repeated characteristics'**
  String get specialistFamilyPatternEvidenceSemanticLow;

  /// Badge when one linked child matched a pattern.
  ///
  /// In en, this message translates to:
  /// **'{count} Child Matched'**
  String specialistFamilyPatternMatchedChildrenOne(int count);

  /// Badge when multiple linked children matched a pattern.
  ///
  /// In en, this message translates to:
  /// **'{count} Children Matched'**
  String specialistFamilyPatternMatchedChildrenMany(int count);

  /// Helper text under matched children badge.
  ///
  /// In en, this message translates to:
  /// **'Matched at least one detected pattern.'**
  String get specialistFamilyPatternMatchedAtLeastOne;

  /// Collapse expanded family pattern findings.
  ///
  /// In en, this message translates to:
  /// **'Show fewer findings'**
  String get specialistFamilyPatternShowFewerFindings;

  /// Expand hidden family pattern findings.
  ///
  /// In en, this message translates to:
  /// **'View all findings'**
  String get specialistFamilyPatternViewAllFindings;

  /// Action to open family pattern details sheet.
  ///
  /// In en, this message translates to:
  /// **'Review Matched Children'**
  String get specialistFamilyPatternReviewMatchedChildren;

  /// Family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Shared Diagnosis'**
  String get specialistFamilyPatternSharedDiagnosis;

  /// Family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Shared Case Category'**
  String get specialistFamilyPatternSharedCaseCategory;

  /// Family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Observed Difficulties'**
  String get specialistFamilyPatternObservedDifficulties;

  /// Family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Previous Diagnosis'**
  String get specialistFamilyPatternPreviousDiagnosis;

  /// Family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Family History'**
  String get specialistFamilyPatternFamilyHistory;

  /// Fallback family pattern type label.
  ///
  /// In en, this message translates to:
  /// **'Repeated Characteristic'**
  String get specialistFamilyPatternRepeatedCharacteristic;

  /// Title for the family pattern details bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'Family Pattern Details'**
  String get specialistFamilyPatternDetailsTitle;

  /// Subtitle for the family pattern details bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'Review which linked children matched each detected pattern.'**
  String get specialistFamilyPatternDetailsSubtitle;

  /// Error when family pattern details fail to load.
  ///
  /// In en, this message translates to:
  /// **'Unable to load matched children details.'**
  String get specialistFamilyPatternLoadDetailsFailed;

  /// Empty state in family pattern details sheet.
  ///
  /// In en, this message translates to:
  /// **'No detailed matches are available.'**
  String get specialistFamilyPatternNoDetailedMatches;

  /// Notice when one matched child is hidden due to access.
  ///
  /// In en, this message translates to:
  /// **'Some matched children are not shown because you are not assigned to their records.'**
  String get specialistFamilyPatternHiddenMatchesOne;

  /// Notice when multiple matched children are hidden due to access.
  ///
  /// In en, this message translates to:
  /// **'{count} matched children are not shown because you are not assigned to their records.'**
  String specialistFamilyPatternHiddenMatchesMany(int count);

  /// Label above overlapping keyword chips.
  ///
  /// In en, this message translates to:
  /// **'Shared terms:'**
  String get specialistFamilyPatternSharedTerms;

  /// Label for a matched value on a child row.
  ///
  /// In en, this message translates to:
  /// **'Matched value: {value}'**
  String specialistFamilyPatternMatchedValue(String value);

  /// Action to add a clinical note from family pattern details.
  ///
  /// In en, this message translates to:
  /// **'Add Clinical Note'**
  String get specialistFamilyPatternAddClinicalNote;

  /// Action to message the parent from family pattern details.
  ///
  /// In en, this message translates to:
  /// **'Contact Parent'**
  String get specialistFamilyPatternContactParent;

  /// Action to schedule a follow-up session from family pattern details.
  ///
  /// In en, this message translates to:
  /// **'Schedule Follow-up'**
  String get specialistFamilyPatternScheduleFollowUp;

  /// Shown when an action is already in progress.
  ///
  /// In en, this message translates to:
  /// **'Please wait…'**
  String get commonPleaseWait;

  /// Save button on the edit treatment plan screen.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get specialistTreatmentPlanSaveChanges;

  /// Snack bar after creating a treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Treatment plan created successfully'**
  String get specialistTreatmentPlanCreatedSuccess;

  /// Snack bar after updating a treatment plan.
  ///
  /// In en, this message translates to:
  /// **'Treatment plan updated successfully'**
  String get specialistTreatmentPlanUpdatedSuccess;

  /// Empty state when a treatment plan cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Treatment plan not found.'**
  String get specialistTreatmentPlanNotFound;

  /// Helper text on the create treatment plan screen.
  ///
  /// In en, this message translates to:
  /// **'New plans are created as Active.'**
  String get specialistTreatmentPlanNewPlansActiveHelper;

  /// Label for the treatment plan title field.
  ///
  /// In en, this message translates to:
  /// **'Plan title'**
  String get specialistTreatmentPlanTitleLabel;

  /// Hint for the treatment plan title field.
  ///
  /// In en, this message translates to:
  /// **'Treatment plan title'**
  String get specialistTreatmentPlanTitleHint;

  /// Create button label while saving.
  ///
  /// In en, this message translates to:
  /// **'Creating...'**
  String get specialistTreatmentPlanCreating;

  /// Section heading on the edit treatment plan screen.
  ///
  /// In en, this message translates to:
  /// **'Current Goals'**
  String get specialistTreatmentPlanCurrentGoals;

  /// Empty goals state on the edit treatment plan screen.
  ///
  /// In en, this message translates to:
  /// **'No goals defined for this plan.'**
  String get specialistTreatmentPlanNoGoalsForPlan;

  /// Placeholder when no date is selected.
  ///
  /// In en, this message translates to:
  /// **'Select date'**
  String get specialistTreatmentPlanSelectDate;

  /// Validation when patient is missing on create.
  ///
  /// In en, this message translates to:
  /// **'Patient is required'**
  String get specialistTreatmentPlanPatientRequired;

  /// Validation when plan title is empty.
  ///
  /// In en, this message translates to:
  /// **'Plan title is required'**
  String get specialistTreatmentPlanTitleRequired;

  /// Validation when start date is missing.
  ///
  /// In en, this message translates to:
  /// **'Start date is required'**
  String get specialistTreatmentPlanStartDateRequired;

  /// Validation when end date precedes start date.
  ///
  /// In en, this message translates to:
  /// **'End date cannot be before start date'**
  String get specialistTreatmentPlanEndDateBeforeStart;

  /// Generic error when plan creation fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to create treatment plan. Please try again.'**
  String get specialistTreatmentPlanCreateFailed;

  /// Error when edit treatment plan data fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load treatment plan: {error}'**
  String specialistTreatmentPlanLoadFailed(String error);

  /// Generic error when plan update fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save treatment plan. Please try again.'**
  String get specialistTreatmentPlanSaveFailed;

  /// Snack bar after creating a goal.
  ///
  /// In en, this message translates to:
  /// **'Goal created successfully'**
  String get specialistGoalsCreatedSuccess;

  /// Snack bar after updating a goal.
  ///
  /// In en, this message translates to:
  /// **'Goal updated successfully'**
  String get specialistGoalsUpdatedSuccess;

  /// Snack bar after updating goal progress.
  ///
  /// In en, this message translates to:
  /// **'Progress updated successfully'**
  String get specialistGoalsProgressUpdatedSuccess;

  /// Snack bar after archiving/achieving a goal.
  ///
  /// In en, this message translates to:
  /// **'Goal marked as achieved'**
  String get specialistGoalsMarkedAchievedSuccess;

  /// Empty state when goals bundle is unavailable.
  ///
  /// In en, this message translates to:
  /// **'Goals could not be loaded.'**
  String get specialistGoalsCouldNotLoad;

  /// Error when manage goals has no active plan.
  ///
  /// In en, this message translates to:
  /// **'No active treatment plan found for this patient.'**
  String get specialistGoalsNoActivePlanForPatient;

  /// Empty state on manage goals screen.
  ///
  /// In en, this message translates to:
  /// **'No goals defined for this treatment plan.'**
  String get specialistGoalsNoGoalsForPlan;

  /// Button to add a goal on manage goals screen.
  ///
  /// In en, this message translates to:
  /// **'Add New Goal'**
  String get specialistGoalsAddNewGoal;

  /// Action to update goal progress.
  ///
  /// In en, this message translates to:
  /// **'Update Progress'**
  String get specialistGoalsUpdateProgress;

  /// Action to edit a goal.
  ///
  /// In en, this message translates to:
  /// **'Edit Goal'**
  String get specialistGoalsEditGoal;

  /// Action to archive a goal.
  ///
  /// In en, this message translates to:
  /// **'Archive Goal'**
  String get specialistGoalsArchiveGoal;

  /// Helper text under an achieved goal card.
  ///
  /// In en, this message translates to:
  /// **'This goal is marked as achieved.'**
  String get specialistGoalsMarkedAchievedHelper;

  /// Title for the add goal dialog.
  ///
  /// In en, this message translates to:
  /// **'Add New Goal'**
  String get specialistGoalsAddDialogTitle;

  /// Title for the edit goal dialog.
  ///
  /// In en, this message translates to:
  /// **'Edit Goal'**
  String get specialistGoalsEditDialogTitle;

  /// Title for the update progress dialog.
  ///
  /// In en, this message translates to:
  /// **'Update Progress'**
  String get specialistGoalsUpdateProgressDialogTitle;

  /// Title for the archive goal confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'Archive Goal'**
  String get specialistGoalsArchiveDialogTitle;

  /// Body for the archive goal confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'There is no dedicated archive endpoint. This will mark the goal as achieved using PATCH /goals/:id/achieve.'**
  String get specialistGoalsArchiveDialogBody;

  /// Confirm action in archive goal dialog.
  ///
  /// In en, this message translates to:
  /// **'Mark as Achieved'**
  String get specialistGoalsMarkAchieved;

  /// Label for short-term/long-term selector.
  ///
  /// In en, this message translates to:
  /// **'Goal type'**
  String get specialistGoalsGoalType;

  /// Hint for goal title field.
  ///
  /// In en, this message translates to:
  /// **'Goal title'**
  String get specialistGoalsTitleHint;

  /// Hint for optional target value field.
  ///
  /// In en, this message translates to:
  /// **'Target value (optional)'**
  String get specialistGoalsTargetValueOptional;

  /// Label for optional target date picker.
  ///
  /// In en, this message translates to:
  /// **'Target date (optional)'**
  String get specialistGoalsTargetDateOptional;

  /// Hint for optional goal description field.
  ///
  /// In en, this message translates to:
  /// **'Description (optional)'**
  String get specialistGoalsDescriptionOptional;

  /// Validation when goal title is empty.
  ///
  /// In en, this message translates to:
  /// **'Goal title is required'**
  String get specialistGoalsTitleRequired;

  /// Validation when target value is not numeric.
  ///
  /// In en, this message translates to:
  /// **'Target value must be a number'**
  String get specialistGoalsTargetValueMustBeNumber;

  /// Validation in update progress dialog.
  ///
  /// In en, this message translates to:
  /// **'Enter a progress value between 0 and 100'**
  String get specialistGoalsProgressRangeValidation;

  /// Validation from goals provider.
  ///
  /// In en, this message translates to:
  /// **'Progress must be between 0 and 100'**
  String get specialistGoalsProgressRangeProvider;

  /// Hint for progress percentage field.
  ///
  /// In en, this message translates to:
  /// **'Completion percentage (0–100)'**
  String get specialistGoalsCompletionPercentageHint;

  /// Hint for optional progress notes field.
  ///
  /// In en, this message translates to:
  /// **'Progress note (optional)'**
  String get specialistGoalsProgressNoteOptional;

  /// Save button in update progress dialog.
  ///
  /// In en, this message translates to:
  /// **'Save Progress'**
  String get specialistGoalsSaveProgress;

  /// Confirm button in add goal dialog.
  ///
  /// In en, this message translates to:
  /// **'Add Goal'**
  String get specialistGoalsAddGoal;

  /// Switch label in edit goal dialog.
  ///
  /// In en, this message translates to:
  /// **'Mark as achieved'**
  String get specialistGoalsMarkAsAchieved;

  /// Validation when creating a goal without an active plan.
  ///
  /// In en, this message translates to:
  /// **'No active treatment plan found'**
  String get specialistGoalsNoActivePlan;

  /// Error when goals fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load goals: {error}'**
  String specialistGoalsLoadFailed(String error);

  /// Error when goals fail to refresh.
  ///
  /// In en, this message translates to:
  /// **'Failed to refresh goals: {error}'**
  String specialistGoalsRefreshFailed(String error);

  /// Error when goal creation fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to create goal: {error}'**
  String specialistGoalsCreateFailed(String error);

  /// Error when goal update fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update goal: {error}'**
  String specialistGoalsUpdateFailed(String error);

  /// Error when goal progress update fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update progress: {error}'**
  String specialistGoalsProgressUpdateFailed(String error);

  /// Error when archiving a goal fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to archive goal: {error}'**
  String specialistGoalsArchiveFailed(String error);

  /// English language label.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// Arabic language label.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get languageArabic;

  /// Clear a selected value.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get commonClear;

  /// One-time exercise assignment frequency.
  ///
  /// In en, this message translates to:
  /// **'One time'**
  String get exerciseFrequencyOneTime;

  /// Title and action to edit an exercise.
  ///
  /// In en, this message translates to:
  /// **'Edit Exercise'**
  String get specialistExerciseEditExercise;

  /// App bar title for exercise details.
  ///
  /// In en, this message translates to:
  /// **'Exercise Details'**
  String get specialistExerciseDetailsTitle;

  /// Subtitle on create/edit exercise form.
  ///
  /// In en, this message translates to:
  /// **'Add therapy exercises to the shared library for assignment.'**
  String get specialistExerciseFormSubtitle;

  /// Error when exercise categories fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load categories. Please retry.'**
  String get specialistExerciseCategoriesLoadFailed;

  /// Empty state when no categories exist.
  ///
  /// In en, this message translates to:
  /// **'No exercise categories available yet.'**
  String get specialistExerciseNoCategories;

  /// Empty state when exercise cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Exercise not found.'**
  String get specialistExerciseNotFound;

  /// Generic error when exercise details fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load exercise. Please try again.'**
  String get specialistExerciseLoadFailed;

  /// Error when loading exercise for edit fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load exercise details.'**
  String get specialistExerciseDetailsLoadFailed;

  /// Media picker option for images.
  ///
  /// In en, this message translates to:
  /// **'Choose image'**
  String get specialistExerciseChooseImage;

  /// Media picker option for videos.
  ///
  /// In en, this message translates to:
  /// **'Choose video'**
  String get specialistExerciseChooseVideo;

  /// Media picker option for audio or files.
  ///
  /// In en, this message translates to:
  /// **'Choose audio / file'**
  String get specialistExerciseChooseAudioFile;

  /// Snack bar when selected media cannot be read.
  ///
  /// In en, this message translates to:
  /// **'Unable to read the selected file.'**
  String get specialistExerciseUnableReadFile;

  /// Snack bar for invalid media type.
  ///
  /// In en, this message translates to:
  /// **'Unsupported media type. Use image, audio, PDF, or MP4/MOV video.'**
  String get specialistExerciseUnsupportedMediaType;

  /// Snack bar when media exceeds size limit.
  ///
  /// In en, this message translates to:
  /// **'File is too large. Maximum size is 50 MB.'**
  String get specialistExerciseFileTooLarge;

  /// Validation when category is missing.
  ///
  /// In en, this message translates to:
  /// **'Please select a category.'**
  String get specialistExerciseSelectCategory;

  /// Validation when exercise title is empty.
  ///
  /// In en, this message translates to:
  /// **'Title is required.'**
  String get specialistExerciseTitleRequired;

  /// Label for exercise language dropdown.
  ///
  /// In en, this message translates to:
  /// **'Exercise Language'**
  String get specialistExerciseLanguageField;

  /// Label for exercise category dropdown.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get specialistExerciseCategoryField;

  /// Label for exercise title field.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get specialistExerciseTitleField;

  /// Hint for optional description field.
  ///
  /// In en, this message translates to:
  /// **'Description (optional)'**
  String get specialistExerciseDescriptionOptional;

  /// Hint for instructions field.
  ///
  /// In en, this message translates to:
  /// **'Detailed instructions'**
  String get specialistExerciseInstructionsField;

  /// Label for expected speech text used by analysis.
  ///
  /// In en, this message translates to:
  /// **'Expected Text'**
  String get specialistExerciseExpectedTextField;

  /// Helper text for expected speech text.
  ///
  /// In en, this message translates to:
  /// **'The exact phrase the patient should say. Used for word and phoneme alignment.'**
  String get specialistExerciseExpectedTextHelper;

  /// Validation when expected text is missing for speech exercises.
  ///
  /// In en, this message translates to:
  /// **'Expected Text is required for Speech Articulation exercises.'**
  String get specialistExerciseExpectedTextRequired;

  /// Label for optional target phoneme.
  ///
  /// In en, this message translates to:
  /// **'Target Sound'**
  String get specialistExerciseTargetSoundField;

  /// Helper text for target phoneme.
  ///
  /// In en, this message translates to:
  /// **'Optional target speech sound for phoneme-level analysis, e.g. r.'**
  String get specialistExerciseTargetSoundHelper;

  /// Detail section heading for expected text.
  ///
  /// In en, this message translates to:
  /// **'Expected Text'**
  String get specialistExerciseExpectedTextSection;

  /// Detail section heading for target sound.
  ///
  /// In en, this message translates to:
  /// **'Target Sound'**
  String get specialistExerciseTargetSoundSection;

  /// Section heading for instructional media.
  ///
  /// In en, this message translates to:
  /// **'Instructional media (optional)'**
  String get specialistExerciseInstructionMediaSection;

  /// Label when existing media is attached.
  ///
  /// In en, this message translates to:
  /// **'Current media attached'**
  String get specialistExerciseCurrentMediaAttached;

  /// Helper when no instructional media is selected.
  ///
  /// In en, this message translates to:
  /// **'No media selected. Images, audio, PDF, and MP4/MOV video are supported (max 50 MB).'**
  String get specialistExerciseNoMediaSelected;

  /// Button to replace instructional media.
  ///
  /// In en, this message translates to:
  /// **'Replace media'**
  String get specialistExerciseReplaceMedia;

  /// Button to add instructional media.
  ///
  /// In en, this message translates to:
  /// **'Add media'**
  String get specialistExerciseAddMedia;

  /// Tooltip for removing instructional media.
  ///
  /// In en, this message translates to:
  /// **'Remove media'**
  String get specialistExerciseRemoveMediaTooltip;

  /// Save button label while uploading media.
  ///
  /// In en, this message translates to:
  /// **'Uploading media...'**
  String get specialistExerciseUploadingMedia;

  /// Create button on add exercise form.
  ///
  /// In en, this message translates to:
  /// **'Create Exercise'**
  String get specialistExerciseCreateExercise;

  /// Snack bar after creating an exercise.
  ///
  /// In en, this message translates to:
  /// **'Exercise created successfully'**
  String get specialistExerciseCreatedSuccess;

  /// Snack bar after updating an exercise.
  ///
  /// In en, this message translates to:
  /// **'Exercise updated successfully'**
  String get specialistExerciseUpdatedSuccess;

  /// Generic error when saving an exercise fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save exercise. Please try again.'**
  String get specialistExerciseSaveFailed;

  /// Language label on exercise details.
  ///
  /// In en, this message translates to:
  /// **'Language: {language}'**
  String specialistExerciseLanguageLine(String language);

  /// Creator label on exercise details.
  ///
  /// In en, this message translates to:
  /// **'Created by {name}'**
  String specialistExerciseCreatedBy(String name);

  /// Description section heading.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get specialistExerciseDescriptionSection;

  /// Fallback when exercise has no description.
  ///
  /// In en, this message translates to:
  /// **'No description available.'**
  String get specialistExerciseNoDescription;

  /// Instructions section heading.
  ///
  /// In en, this message translates to:
  /// **'Instructions'**
  String get specialistExerciseInstructionsSection;

  /// Fallback when exercise has no instructions.
  ///
  /// In en, this message translates to:
  /// **'No instructions available.'**
  String get specialistExerciseNoInstructions;

  /// Title for instruction media card.
  ///
  /// In en, this message translates to:
  /// **'Instruction Media'**
  String get specialistExerciseInstructionMediaTitle;

  /// Subtitle on assign exercise screen.
  ///
  /// In en, this message translates to:
  /// **'Choose an exercise, then set frequency and dates.'**
  String get specialistAssignExerciseSubtitle;

  /// Validation when no exercise is selected.
  ///
  /// In en, this message translates to:
  /// **'Please select an exercise.'**
  String get specialistAssignExerciseSelectRequired;

  /// Snack bar after assigning an exercise.
  ///
  /// In en, this message translates to:
  /// **'Exercise assigned successfully'**
  String get specialistAssignExerciseSuccess;

  /// Assign button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Assigning...'**
  String get specialistAssignExerciseAssigning;

  /// Empty state on assign exercise picker.
  ///
  /// In en, this message translates to:
  /// **'No exercises match your search or filter.'**
  String get specialistAssignExerciseNoMatchSearch;

  /// Heading for selected exercise summary.
  ///
  /// In en, this message translates to:
  /// **'Selected exercise'**
  String get specialistAssignExerciseSelectedExercise;

  /// Frequency section heading.
  ///
  /// In en, this message translates to:
  /// **'Frequency'**
  String get specialistAssignExerciseFrequency;

  /// Due date section heading.
  ///
  /// In en, this message translates to:
  /// **'Due date (optional)'**
  String get specialistAssignExerciseDueDateOptional;

  /// Button to set optional due date.
  ///
  /// In en, this message translates to:
  /// **'Set due date'**
  String get specialistAssignExerciseSetDueDate;

  /// Generic error when assignment fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to assign exercise. Please try again.'**
  String get specialistAssignExerciseFailed;

  /// Validation when assignment prerequisites are missing.
  ///
  /// In en, this message translates to:
  /// **'Patient, treatment plan, and exercise are required to assign.'**
  String get specialistAssignExerciseRequirementsMissing;

  /// App bar title for assigned exercise details.
  ///
  /// In en, this message translates to:
  /// **'Assigned Exercise'**
  String get specialistAssignedExerciseTitle;

  /// Empty state when assigned exercise cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Assigned exercise not found.'**
  String get specialistAssignedExerciseNotFound;

  /// Error when assigned exercise fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load assigned exercise.'**
  String get specialistAssignedExerciseLoadFailed;

  /// Assignment metadata section heading.
  ///
  /// In en, this message translates to:
  /// **'Assignment'**
  String get specialistAssignedExerciseAssignmentSection;

  /// Assignment frequency label.
  ///
  /// In en, this message translates to:
  /// **'Frequency'**
  String get specialistAssignedExerciseFrequency;

  /// Assignment date label.
  ///
  /// In en, this message translates to:
  /// **'Assigned'**
  String get specialistAssignedExerciseAssigned;

  /// Due date label on assigned exercise.
  ///
  /// In en, this message translates to:
  /// **'Due date'**
  String get specialistAssignedExerciseDueDate;

  /// Latest submission section heading.
  ///
  /// In en, this message translates to:
  /// **'Latest Submission'**
  String get specialistAssignedExerciseLatestSubmission;

  /// Empty state when no submissions exist.
  ///
  /// In en, this message translates to:
  /// **'No submissions for this assignment yet.'**
  String get specialistAssignedExerciseNoSubmissions;

  /// Fallback date for recent submission.
  ///
  /// In en, this message translates to:
  /// **'Recently submitted'**
  String get specialistAssignedExerciseRecentlySubmitted;

  /// Link to library exercise from assignment.
  ///
  /// In en, this message translates to:
  /// **'Open library exercise'**
  String get specialistAssignedExerciseOpenLibraryExercise;

  /// Instructional media card title on assigned exercise.
  ///
  /// In en, this message translates to:
  /// **'Instructional Media'**
  String get specialistAssignedExerciseInstructionalMedia;

  /// Button to deactivate an assigned exercise.
  ///
  /// In en, this message translates to:
  /// **'Deactivate Assignment'**
  String get specialistAssignedExerciseDeactivateAssignment;

  /// Confirm dialog title for deactivating assignment.
  ///
  /// In en, this message translates to:
  /// **'Deactivate Assignment'**
  String get specialistAssignedExerciseDeactivateTitle;

  /// Confirm dialog body for deactivating assignment.
  ///
  /// In en, this message translates to:
  /// **'This exercise will no longer be active for the patient. Previous submissions, reviews, and related history will be preserved. The exercise will remain in the library.'**
  String get specialistAssignedExerciseDeactivateBody;

  /// Confirm button label for deactivating assignment.
  ///
  /// In en, this message translates to:
  /// **'Deactivate Assignment'**
  String get specialistAssignedExerciseDeactivateConfirm;

  /// SnackBar after successful assignment deactivation.
  ///
  /// In en, this message translates to:
  /// **'Assignment deactivated.'**
  String get specialistAssignedExerciseDeactivateSuccess;

  /// Error when deactivation fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to deactivate assigned exercise.'**
  String get specialistAssignedExerciseDeactivateFailed;

  /// Shown when assignment is already inactive.
  ///
  /// In en, this message translates to:
  /// **'This assignment is already inactive.'**
  String get specialistAssignedExerciseAlreadyInactive;

  /// Busy label while deactivating assignment.
  ///
  /// In en, this message translates to:
  /// **'Deactivating...'**
  String get specialistAssignedExerciseDeactivating;

  /// High priority badge label.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get priorityHigh;

  /// Medium priority badge label.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get priorityMedium;

  /// App bar title for reviewing an exercise submission.
  ///
  /// In en, this message translates to:
  /// **'Review Exercise'**
  String get specialistReviewExerciseTitle;

  /// Section heading for submission media.
  ///
  /// In en, this message translates to:
  /// **'Uploaded Media'**
  String get specialistReviewUploadedMedia;

  /// Empty state when submission has no media.
  ///
  /// In en, this message translates to:
  /// **'No media uploaded for this submission.'**
  String get specialistReviewNoMedia;

  /// Review form section heading.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get specialistReviewSection;

  /// Performance rating label on review form.
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get specialistReviewRating;

  /// Feedback field label on review form.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get specialistReviewFeedback;

  /// Hint for specialist feedback text field.
  ///
  /// In en, this message translates to:
  /// **'Write feedback for the parent and patient...'**
  String get specialistReviewFeedbackHint;

  /// Submit review button label.
  ///
  /// In en, this message translates to:
  /// **'Submit Review'**
  String get specialistReviewSubmitReview;

  /// Update existing review button label.
  ///
  /// In en, this message translates to:
  /// **'Update Review'**
  String get specialistReviewUpdateReview;

  /// Submit review button label while saving.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get specialistReviewSubmitting;

  /// Snack bar after review is saved.
  ///
  /// In en, this message translates to:
  /// **'Review submitted successfully'**
  String get specialistReviewSubmittedSuccess;

  /// Empty state when submission cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Submission not found.'**
  String get specialistReviewSubmissionNotFound;

  /// Validation when specialist is not signed in.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to submit a review.'**
  String get specialistReviewSignInRequired;

  /// Error when submission review data fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load submission: {error}'**
  String specialistReviewLoadFailed(String error);

  /// Error when saving a review fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit review: {error}'**
  String specialistReviewSubmitFailed(String error);

  /// Button to open speech analysis for audio submission.
  ///
  /// In en, this message translates to:
  /// **'View Speech Analysis'**
  String get specialistReviewViewSpeechAnalysis;

  /// Empty state when submission media URL is missing.
  ///
  /// In en, this message translates to:
  /// **'Media file unavailable.'**
  String get specialistSubmissionMediaUnavailable;

  /// Empty state when media cannot be previewed.
  ///
  /// In en, this message translates to:
  /// **'Unsupported media type for preview.'**
  String get specialistSubmissionUnsupportedMediaPreview;

  /// Error when video preview fails to load.
  ///
  /// In en, this message translates to:
  /// **'Unable to load video.'**
  String get specialistSubmissionUnableLoadVideo;

  /// Error when audio preview fails to load.
  ///
  /// In en, this message translates to:
  /// **'Unable to load audio.'**
  String get specialistSubmissionUnableLoadAudio;

  /// Fallback when media upload timestamp is missing.
  ///
  /// In en, this message translates to:
  /// **'Upload time unavailable'**
  String get specialistSubmissionUploadTimeUnavailable;

  /// Generic failed state.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get statusFailed;

  /// Subtitle under patient name on speech analysis screen.
  ///
  /// In en, this message translates to:
  /// **'Speech analysis results'**
  String get specialistSpeechAnalysisResultsSubtitle;

  /// Latest analysis timestamp on speech analysis header.
  ///
  /// In en, this message translates to:
  /// **'Latest: {dateTime}'**
  String specialistSpeechAnalysisLatestLine(String dateTime);

  /// Submission identifier on speech analysis header.
  ///
  /// In en, this message translates to:
  /// **'Submission {id}'**
  String specialistSpeechAnalysisSubmissionLine(String id);

  /// Scores section heading.
  ///
  /// In en, this message translates to:
  /// **'Scores'**
  String get specialistSpeechAnalysisScores;

  /// Transcript section heading.
  ///
  /// In en, this message translates to:
  /// **'Transcript'**
  String get specialistSpeechAnalysisTranscript;

  /// Detected language on transcript card.
  ///
  /// In en, this message translates to:
  /// **'Language: {language}'**
  String specialistSpeechAnalysisLanguageLine(String language);

  /// Recording duration on transcript card.
  ///
  /// In en, this message translates to:
  /// **'Duration: {seconds}s'**
  String specialistSpeechAnalysisDurationLine(String seconds);

  /// Empty transcript fallback.
  ///
  /// In en, this message translates to:
  /// **'No transcript available for this analysis.'**
  String get specialistSpeechAnalysisNoTranscript;

  /// Comparison section heading.
  ///
  /// In en, this message translates to:
  /// **'Comparison with Previous'**
  String get specialistSpeechAnalysisComparisonTitle;

  /// Previous analysis date in comparison card.
  ///
  /// In en, this message translates to:
  /// **'Previous: {date}'**
  String specialistSpeechAnalysisPreviousLine(String date);

  /// Baseline speech analysis trend badge.
  ///
  /// In en, this message translates to:
  /// **'Baseline'**
  String get specialistSpeechAnalysisTrendBaseline;

  /// Declining speech analysis trend badge.
  ///
  /// In en, this message translates to:
  /// **'Declining'**
  String get specialistSpeechAnalysisTrendDeclining;

  /// AI feedback section heading.
  ///
  /// In en, this message translates to:
  /// **'AI Feedback & Recommendations'**
  String get specialistSpeechAnalysisAiFeedbackTitle;

  /// AI improvement summary subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Improvement Summary'**
  String get specialistSpeechAnalysisImprovementSummary;

  /// Clinical note subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Clinical Note'**
  String get specialistSpeechAnalysisClinicalNote;

  /// Recommended action subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Recommended Action'**
  String get specialistSpeechAnalysisRecommendedAction;

  /// Recommendations subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Recommendations'**
  String get specialistSpeechAnalysisRecommendations;

  /// Treatment analysis subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Treatment Analysis'**
  String get specialistSpeechAnalysisTreatmentAnalysis;

  /// Decision support subsection heading.
  ///
  /// In en, this message translates to:
  /// **'Decision Support'**
  String get specialistSpeechAnalysisDecisionSupport;

  /// Word-analysis chip for correct expected-vs-ASR matches.
  ///
  /// In en, this message translates to:
  /// **'Correct'**
  String get specialistSpeechAnalysisWordCorrect;

  /// Word-analysis chip for expected-vs-ASR mismatches (not clinical substitution).
  ///
  /// In en, this message translates to:
  /// **'ASR Mismatches'**
  String get specialistSpeechAnalysisAsrMismatches;

  /// Word-analysis chip for omitted expected words.
  ///
  /// In en, this message translates to:
  /// **'Omissions'**
  String get specialistSpeechAnalysisWordOmissions;

  /// Word-analysis chip for ASR insertions.
  ///
  /// In en, this message translates to:
  /// **'Insertions'**
  String get specialistSpeechAnalysisWordInsertions;

  /// Progress insights heading for repeated expected-vs-ASR mismatches.
  ///
  /// In en, this message translates to:
  /// **'Repeated ASR Mismatches'**
  String get specialistSpeechAnalysisRepeatedAsrMismatches;

  /// Count line for a repeated expected→ASR mismatch pair.
  ///
  /// In en, this message translates to:
  /// **'Detected {count} times'**
  String specialistSpeechAnalysisAsrMismatchDetectedCount(int count);

  /// Suggested action prefix before AI-generated action text.
  ///
  /// In en, this message translates to:
  /// **'Suggested: {action}'**
  String specialistSpeechAnalysisSuggestedLine(String action);

  /// Progress chart heading.
  ///
  /// In en, this message translates to:
  /// **'Overall Score Trend'**
  String get specialistSpeechAnalysisOverallScoreTrend;

  /// Fallback when analysis date is missing.
  ///
  /// In en, this message translates to:
  /// **'Unknown date'**
  String get specialistSpeechAnalysisUnknownDate;

  /// Deprecated legacy history summary; kept for compatibility.
  ///
  /// In en, this message translates to:
  /// **'Overall {overall} • Pronunciation {pronunciation}'**
  String specialistSpeechAnalysisHistorySummary(
    String overall,
    String pronunciation,
  );

  /// History tile summary using deterministic word accuracy.
  ///
  /// In en, this message translates to:
  /// **'Word Accuracy: {accuracy}%'**
  String specialistSpeechAnalysisHistoryWordAccuracy(String accuracy);

  /// History tile summary when word accuracy is unavailable.
  ///
  /// In en, this message translates to:
  /// **'Speech analysis'**
  String get specialistSpeechAnalysisHistoryFallback;

  /// Analyze card title.
  ///
  /// In en, this message translates to:
  /// **'Run Speech Analysis'**
  String get specialistSpeechAnalysisRunTitle;

  /// Analyze card subtitle.
  ///
  /// In en, this message translates to:
  /// **'Analyze the audio from this exercise submission using speech recognition.'**
  String get specialistSpeechAnalysisRunSubtitle;

  /// Analyze button label while running.
  ///
  /// In en, this message translates to:
  /// **'Analyzing...'**
  String get specialistSpeechAnalysisAnalyzing;

  /// Analyze submission button label.
  ///
  /// In en, this message translates to:
  /// **'Analyze Submission'**
  String get specialistSpeechAnalysisAnalyzeSubmission;

  /// Selected analysis summary section heading.
  ///
  /// In en, this message translates to:
  /// **'Latest Analysis Summary'**
  String get specialistSpeechAnalysisLatestSummary;

  /// Analysis history section heading.
  ///
  /// In en, this message translates to:
  /// **'Analysis History'**
  String get specialistSpeechAnalysisHistory;

  /// Empty state when no analysis exists.
  ///
  /// In en, this message translates to:
  /// **'No speech analysis results yet. Run analysis on an audio submission to get started.'**
  String get specialistSpeechAnalysisEmptyResults;

  /// Empty state when history list is empty.
  ///
  /// In en, this message translates to:
  /// **'No previous speech analyses recorded.'**
  String get specialistSpeechAnalysisEmptyHistory;

  /// Validation when analyze is tapped without a submission.
  ///
  /// In en, this message translates to:
  /// **'No submission selected for speech analysis.'**
  String get specialistSpeechAnalysisNoSubmissionSelected;

  /// Snack bar when cached analysis is shown.
  ///
  /// In en, this message translates to:
  /// **'Existing speech analysis loaded.'**
  String get specialistSpeechAnalysisExistingLoaded;

  /// Snack bar after analysis completes.
  ///
  /// In en, this message translates to:
  /// **'Speech analysis completed successfully.'**
  String get specialistSpeechAnalysisCompletedSuccess;

  /// Generic analyze failure message.
  ///
  /// In en, this message translates to:
  /// **'Speech analysis could not be completed. Please try again.'**
  String get specialistSpeechAnalysisAnalyzeFailed;

  /// Generic load failure message.
  ///
  /// In en, this message translates to:
  /// **'Failed to load speech analysis. Please try again.'**
  String get specialistSpeechAnalysisLoadFailed;

  /// 403 error when analyzing submission.
  ///
  /// In en, this message translates to:
  /// **'You do not have permission to analyze this submission.'**
  String get specialistSpeechAnalysisPermissionDenied;

  /// 404 error when analysis does not exist yet.
  ///
  /// In en, this message translates to:
  /// **'No speech analysis is available for this submission yet.'**
  String get specialistSpeechAnalysisNotAvailableYet;

  /// 404 error when submission is missing.
  ///
  /// In en, this message translates to:
  /// **'The exercise submission could not be found.'**
  String get specialistSpeechAnalysisSubmissionNotFound;

  /// Validation when submission has no supported audio.
  ///
  /// In en, this message translates to:
  /// **'This submission does not contain a supported audio recording.'**
  String get specialistSpeechAnalysisUnsupportedAudio;

  /// 502/503/504 service error.
  ///
  /// In en, this message translates to:
  /// **'The speech analysis service is currently unavailable. Please try again.'**
  String get specialistSpeechAnalysisServiceUnavailable;

  /// Network/timeout error for speech analysis.
  ///
  /// In en, this message translates to:
  /// **'Unable to connect to the analysis service. Check your connection and try again.'**
  String get specialistSpeechAnalysisConnectionFailed;

  /// Recording source uploaded file.
  ///
  /// In en, this message translates to:
  /// **'Uploaded'**
  String get specialistSpeechAnalysisSourceUploaded;

  /// Recording source in-app recording.
  ///
  /// In en, this message translates to:
  /// **'Recorded'**
  String get specialistSpeechAnalysisSourceRecorded;

  /// App bar title for session details.
  ///
  /// In en, this message translates to:
  /// **'Session Details'**
  String get specialistSessionDetailsTitle;

  /// Empty state when session cannot be loaded.
  ///
  /// In en, this message translates to:
  /// **'Session not found.'**
  String get specialistSessionNotFound;

  /// Generic error when session details fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load session details.'**
  String get specialistSessionLoadFailed;

  /// 403 error when managing a session.
  ///
  /// In en, this message translates to:
  /// **'You do not have permission to manage this session.'**
  String get specialistSessionPermissionDenied;

  /// 400 error when session update is blocked.
  ///
  /// In en, this message translates to:
  /// **'This session cannot be updated. Check the details and try again.'**
  String get specialistSessionUpdateBlocked;

  /// Snack bar when patient profile link is missing.
  ///
  /// In en, this message translates to:
  /// **'Patient profile is unavailable.'**
  String get specialistSessionPatientProfileUnavailable;

  /// Dialog button to dismiss a destructive session action.
  ///
  /// In en, this message translates to:
  /// **'Keep Session'**
  String get specialistSessionKeepSession;

  /// Dialog title for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Mark as Completed'**
  String get specialistSessionMarkCompletedTitle;

  /// Dialog message for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Mark this session as completed? This cannot be undone.'**
  String get specialistSessionMarkCompletedMessage;

  /// Confirm button for completing a session.
  ///
  /// In en, this message translates to:
  /// **'Mark Completed'**
  String get specialistSessionMarkCompletedConfirm;

  /// Snack bar after session is completed.
  ///
  /// In en, this message translates to:
  /// **'Session marked as completed.'**
  String get specialistSessionMarkedCompleted;

  /// Dialog title for marking no show.
  ///
  /// In en, this message translates to:
  /// **'Mark as No Show'**
  String get specialistSessionMarkNoShowTitle;

  /// Dialog message for marking no show.
  ///
  /// In en, this message translates to:
  /// **'Mark this session as no show? This cannot be undone.'**
  String get specialistSessionMarkNoShowMessage;

  /// Confirm button for marking no show.
  ///
  /// In en, this message translates to:
  /// **'Mark No Show'**
  String get specialistSessionMarkNoShowConfirm;

  /// Snack bar after session is marked no show.
  ///
  /// In en, this message translates to:
  /// **'Session marked as no show.'**
  String get specialistSessionMarkedNoShow;

  /// Dialog title for cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Cancel Session'**
  String get specialistSessionCancelTitle;

  /// Dialog message for cancelling a session.
  ///
  /// In en, this message translates to:
  /// **'Cancel this session? This cannot be undone.'**
  String get specialistSessionCancelMessage;

  /// Optional cancellation reason field label.
  ///
  /// In en, this message translates to:
  /// **'Cancellation reason (optional)'**
  String get specialistSessionCancelReasonOptional;

  /// Snack bar after session is cancelled.
  ///
  /// In en, this message translates to:
  /// **'Session cancelled.'**
  String get specialistSessionCancelled;

  /// Snack bar when meeting link is invalid.
  ///
  /// In en, this message translates to:
  /// **'No valid meeting link available.'**
  String get specialistSessionNoMeetingLink;

  /// Snack bar after copying meeting link.
  ///
  /// In en, this message translates to:
  /// **'Meeting link copied.'**
  String get specialistSessionMeetingLinkCopied;

  /// Snack bar when meeting link fails to open.
  ///
  /// In en, this message translates to:
  /// **'Could not open the meeting link. Please try again.'**
  String get specialistSessionCouldNotOpenMeetingLink;

  /// Session start time label.
  ///
  /// In en, this message translates to:
  /// **'Start time'**
  String get specialistSessionStartTime;

  /// Session end time label.
  ///
  /// In en, this message translates to:
  /// **'End time'**
  String get specialistSessionEndTime;

  /// Session duration row label.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get specialistSessionDuration;

  /// Session duration value without label prefix.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min'**
  String specialistSessionMinutesValue(int minutes);

  /// Online meeting link label.
  ///
  /// In en, this message translates to:
  /// **'Meeting Link'**
  String get specialistSessionMeetingLink;

  /// Fallback when optional session field is empty.
  ///
  /// In en, this message translates to:
  /// **'Not provided'**
  String get specialistSessionNotProvided;

  /// Button to open online meeting.
  ///
  /// In en, this message translates to:
  /// **'Open Meeting'**
  String get specialistSessionOpenMeeting;

  /// Button to copy meeting link.
  ///
  /// In en, this message translates to:
  /// **'Copy Link'**
  String get specialistSessionCopyLink;

  /// Button to open patient profile from session.
  ///
  /// In en, this message translates to:
  /// **'View Patient Profile'**
  String get specialistSessionViewPatientProfile;

  /// Session actions section heading.
  ///
  /// In en, this message translates to:
  /// **'Actions'**
  String get specialistSessionActions;

  /// Button to edit a session.
  ///
  /// In en, this message translates to:
  /// **'Edit Session'**
  String get specialistSessionEditSession;

  /// Button to mark session completed.
  ///
  /// In en, this message translates to:
  /// **'Mark as Completed'**
  String get specialistSessionMarkAsCompleted;

  /// Button to mark session as no show.
  ///
  /// In en, this message translates to:
  /// **'Mark as No Show'**
  String get specialistSessionMarkAsNoShow;

  /// Cancellation reason label on session details.
  ///
  /// In en, this message translates to:
  /// **'Cancellation reason'**
  String get specialistSessionCancellationReason;

  /// Message when session status prevents editing.
  ///
  /// In en, this message translates to:
  /// **'This session is {status} and can no longer be edited.'**
  String specialistSessionLockedCannotEdit(String status);

  /// Error when completing a session fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to mark session completed.'**
  String get specialistSessionCompleteFailed;

  /// Error when cancelling a session fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to cancel session.'**
  String get specialistSessionCancelFailed;

  /// Error when marking no show fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to mark session as no show.'**
  String get specialistSessionNoShowFailed;

  /// Error when updating a session fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update session.'**
  String get specialistSessionUpdateFailed;

  /// Error when creating a session fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to create session.'**
  String get specialistSessionCreateFailed;

  /// Title for edit session screen.
  ///
  /// In en, this message translates to:
  /// **'Edit Session'**
  String get specialistSessionEditTitle;

  /// Subtitle on edit session form.
  ///
  /// In en, this message translates to:
  /// **'Update the session schedule details.'**
  String get specialistSessionUpdateSubtitle;

  /// Subtitle on create session form.
  ///
  /// In en, this message translates to:
  /// **'Schedule a session for one of your assigned patients.'**
  String get specialistSessionCreateSubtitle;

  /// Session type field label.
  ///
  /// In en, this message translates to:
  /// **'Session type / title'**
  String get specialistSessionTypeTitle;

  /// Default session type hint.
  ///
  /// In en, this message translates to:
  /// **'Therapy Session'**
  String get specialistSessionTypeHint;

  /// Patient dropdown hint on create session.
  ///
  /// In en, this message translates to:
  /// **'Select patient'**
  String get specialistSessionSelectPatient;

  /// Validation when patient is missing.
  ///
  /// In en, this message translates to:
  /// **'Select an assigned patient.'**
  String get specialistSessionSelectPatientRequired;

  /// Validation when session title is empty.
  ///
  /// In en, this message translates to:
  /// **'Enter a session type or title.'**
  String get specialistSessionTitleRequired;

  /// Validation for session duration range.
  ///
  /// In en, this message translates to:
  /// **'Duration must be between 1 and 480 minutes.'**
  String get specialistSessionDurationRangeError;

  /// Validation when schedule is not in the future.
  ///
  /// In en, this message translates to:
  /// **'Scheduled date and time must be in the future.'**
  String get specialistSessionScheduleFutureRequired;

  /// Empty state when no patients exist for scheduling.
  ///
  /// In en, this message translates to:
  /// **'No assigned patients found. Assign a patient before scheduling.'**
  String get specialistSessionNoAssignedPatients;

  /// Location or meeting link field label.
  ///
  /// In en, this message translates to:
  /// **'Location or meeting link'**
  String get specialistSessionLocationOrLink;

  /// Location field hint.
  ///
  /// In en, this message translates to:
  /// **'Clinic room or https://…'**
  String get specialistSessionLocationHint;

  /// Optional notes field label.
  ///
  /// In en, this message translates to:
  /// **'Notes (optional)'**
  String get specialistSessionNotesOptional;

  /// Optional notes field hint.
  ///
  /// In en, this message translates to:
  /// **'Additional details for this session'**
  String get specialistSessionNotesHint;

  /// Helper text on session form.
  ///
  /// In en, this message translates to:
  /// **'Title and notes are kept for this form. The server stores patient, schedule, duration, and location/link.'**
  String get specialistSessionFormHelper;

  /// Snack bar after session update.
  ///
  /// In en, this message translates to:
  /// **'Session updated successfully.'**
  String get specialistSessionUpdatedSuccess;

  /// Snack bar after session creation.
  ///
  /// In en, this message translates to:
  /// **'Session scheduled successfully.'**
  String get specialistSessionScheduledSuccess;

  /// Error when trying to edit a locked session.
  ///
  /// In en, this message translates to:
  /// **'This session is {status} and cannot be edited.'**
  String specialistSessionCannotEditStatus(String status);

  /// Title for approve session request sheet.
  ///
  /// In en, this message translates to:
  /// **'Approve Session Request'**
  String get specialistSessionRequestApproveTitle;

  /// Title for reject session request sheet.
  ///
  /// In en, this message translates to:
  /// **'Reject Session Request'**
  String get specialistSessionRequestRejectTitle;

  /// Subtitle on reject session request sheet.
  ///
  /// In en, this message translates to:
  /// **'Provide a reason so the parent understands why this request was declined.'**
  String get specialistSessionRequestRejectSubtitle;

  /// Scheduled date picker label.
  ///
  /// In en, this message translates to:
  /// **'Scheduled Date'**
  String get specialistSessionRequestScheduledDate;

  /// Scheduled time picker label.
  ///
  /// In en, this message translates to:
  /// **'Scheduled Time'**
  String get specialistSessionRequestScheduledTime;

  /// Duration field label on approve sheet.
  ///
  /// In en, this message translates to:
  /// **'Duration (minutes)'**
  String get specialistSessionRequestDurationField;

  /// Meeting link or location field label.
  ///
  /// In en, this message translates to:
  /// **'Meeting Link or Location'**
  String get specialistSessionRequestMeetingLinkOrLocation;

  /// Approve session request button label.
  ///
  /// In en, this message translates to:
  /// **'Approve & Create Session'**
  String get specialistSessionRequestApproveCreate;

  /// Approve button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Approving...'**
  String get specialistSessionRequestApproving;

  /// Reject button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Rejecting...'**
  String get specialistSessionRequestRejecting;

  /// Confirm button for rejecting a session request.
  ///
  /// In en, this message translates to:
  /// **'Reject Request'**
  String get specialistSessionRequestRejectConfirm;

  /// Rejection reason field label.
  ///
  /// In en, this message translates to:
  /// **'Rejection Reason'**
  String get specialistSessionRequestRejectReason;

  /// Rejection reason field hint.
  ///
  /// In en, this message translates to:
  /// **'Explain why this request cannot be approved'**
  String get specialistSessionRequestRejectReasonHint;

  /// Validation when rejection reason is empty.
  ///
  /// In en, this message translates to:
  /// **'Rejection reason is required.'**
  String get specialistSessionRequestRejectReasonRequired;

  /// Snack bar after approving session request.
  ///
  /// In en, this message translates to:
  /// **'Session request approved and session created.'**
  String get specialistSessionRequestApprovedSuccess;

  /// Snack bar after rejecting session request.
  ///
  /// In en, this message translates to:
  /// **'Session request rejected.'**
  String get specialistSessionRequestRejectedSuccess;

  /// Error when approving session request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to approve session request: {error}'**
  String specialistSessionRequestApproveFailed(String error);

  /// Error when rejecting session request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to reject session request: {error}'**
  String specialistSessionRequestRejectFailed(String error);

  /// Preferred time period morning.
  ///
  /// In en, this message translates to:
  /// **'Morning'**
  String get specialistSessionRequestPreferredTimeMorning;

  /// Preferred time period afternoon.
  ///
  /// In en, this message translates to:
  /// **'Afternoon'**
  String get specialistSessionRequestPreferredTimeAfternoon;

  /// Preferred time period evening.
  ///
  /// In en, this message translates to:
  /// **'Evening'**
  String get specialistSessionRequestPreferredTimeEvening;

  /// Preferred time period flexible.
  ///
  /// In en, this message translates to:
  /// **'Flexible'**
  String get specialistSessionRequestPreferredTimeFlexible;

  /// Snack bar after copying a session link.
  ///
  /// In en, this message translates to:
  /// **'Link copied'**
  String get specialistSessionLinkCopied;

  /// Snack bar when link is invalid.
  ///
  /// In en, this message translates to:
  /// **'No valid link available'**
  String get specialistSessionNoValidLink;

  /// Snack bar when opening a link fails.
  ///
  /// In en, this message translates to:
  /// **'Could not open link'**
  String get specialistSessionCouldNotOpenLink;

  /// Calendar session tile metadata line.
  ///
  /// In en, this message translates to:
  /// **'{time} • {duration} min • {mode}'**
  String specialistSessionCalendarTileMeta(
    String time,
    int duration,
    String mode,
  );

  /// Snack bar when parent must sign in to message specialist.
  ///
  /// In en, this message translates to:
  /// **'Sign in to send messages.'**
  String get communicationSignInToSendMessages;

  /// Snack bar when child has no assigned specialist.
  ///
  /// In en, this message translates to:
  /// **'No specialist is assigned to this child yet.'**
  String get communicationNoSpecialistAssigned;

  /// Button to open conversation with child's specialist.
  ///
  /// In en, this message translates to:
  /// **'Message Specialist'**
  String get communicationMessageSpecialist;

  /// Loading state on conversations list.
  ///
  /// In en, this message translates to:
  /// **'Loading conversations...'**
  String get communicationLoadingConversations;

  /// Empty state on conversations list.
  ///
  /// In en, this message translates to:
  /// **'No conversations yet.'**
  String get communicationNoConversations;

  /// Conversation list subtitle with start date.
  ///
  /// In en, this message translates to:
  /// **'Started {date}'**
  String communicationStartedOn(String date);

  /// Fallback preview when the latest message has attachments only.
  ///
  /// In en, this message translates to:
  /// **'Attachment'**
  String get communicationListAttachment;

  /// System preview for image attachment messages.
  ///
  /// In en, this message translates to:
  /// **'Sent an image'**
  String get communicationPreviewSentImage;

  /// System preview for audio attachment messages.
  ///
  /// In en, this message translates to:
  /// **'Sent an audio recording'**
  String get communicationPreviewSentAudio;

  /// System preview for PDF attachment messages.
  ///
  /// In en, this message translates to:
  /// **'Sent a PDF file'**
  String get communicationPreviewSentPdf;

  /// System preview for video attachment messages.
  ///
  /// In en, this message translates to:
  /// **'Sent a video'**
  String get communicationPreviewSentVideo;

  /// System preview for generic attachment messages.
  ///
  /// In en, this message translates to:
  /// **'Sent a file'**
  String get communicationPreviewSentFile;

  /// Snack bar while opening a conversation.
  ///
  /// In en, this message translates to:
  /// **'Opening conversation...'**
  String get communicationOpeningConversation;

  /// Loading state on chat screen.
  ///
  /// In en, this message translates to:
  /// **'Loading messages...'**
  String get communicationLoadingMessages;

  /// Empty state on chat screen.
  ///
  /// In en, this message translates to:
  /// **'No messages yet. Say hello to start the conversation.'**
  String get communicationNoMessagesYet;

  /// Chat composer hint.
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get communicationTypeMessageHint;

  /// Read receipt shown under the latest outgoing chat message the recipient has read.
  ///
  /// In en, this message translates to:
  /// **'Seen'**
  String get communicationSeen;

  /// Title of the in-app notification permission prompt.
  ///
  /// In en, this message translates to:
  /// **'Enable notifications'**
  String get notificationsPermissionTitle;

  /// Explains why the app needs notification permission.
  ///
  /// In en, this message translates to:
  /// **'Stay up to date on sessions, exercises, messages, feedback, reports, and other account activity.'**
  String get notificationsPermissionBody;

  /// Confirms the custom prompt and requests the system notification permission.
  ///
  /// In en, this message translates to:
  /// **'Enable notifications'**
  String get notificationsPermissionEnable;

  /// Dismisses the custom notification permission prompt without requesting system permission.
  ///
  /// In en, this message translates to:
  /// **'Maybe later'**
  String get notificationsPermissionMaybeLater;

  /// Chat attachment button hint.
  ///
  /// In en, this message translates to:
  /// **'Attach a file, image, or audio'**
  String get communicationAttachHint;

  /// Day separator for older chat messages.
  ///
  /// In en, this message translates to:
  /// **'Earlier'**
  String get communicationEarlierMessages;

  /// Snack bar when attachment link is missing.
  ///
  /// In en, this message translates to:
  /// **'File link unavailable.'**
  String get communicationFileLinkUnavailable;

  /// Snack bar when attachment link is invalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid file link.'**
  String get communicationInvalidFileLink;

  /// Snack bar after copying attachment link.
  ///
  /// In en, this message translates to:
  /// **'File link copied.'**
  String get communicationFileLinkCopied;

  /// Snack bar when video attachment format is unsupported.
  ///
  /// In en, this message translates to:
  /// **'Unsupported video format.'**
  String get communicationUnsupportedVideoFormat;

  /// Attachment type label for images.
  ///
  /// In en, this message translates to:
  /// **'Image'**
  String get communicationAttachmentTypeImage;

  /// Attachment type label for audio.
  ///
  /// In en, this message translates to:
  /// **'Audio'**
  String get communicationAttachmentTypeAudio;

  /// Attachment type label for video.
  ///
  /// In en, this message translates to:
  /// **'Video'**
  String get communicationAttachmentTypeVideo;

  /// Attachment type label for generic files.
  ///
  /// In en, this message translates to:
  /// **'File'**
  String get communicationAttachmentTypeFile;

  /// Fallback when attachment preview cannot load.
  ///
  /// In en, this message translates to:
  /// **'Preview unavailable'**
  String get communicationAttachmentPreviewUnavailable;

  /// Loading state for audio attachment.
  ///
  /// In en, this message translates to:
  /// **'Loading audio...'**
  String get communicationAudioLoading;

  /// Error when audio playback fails.
  ///
  /// In en, this message translates to:
  /// **'Unable to play audio.'**
  String get communicationAudioPlaybackError;

  /// Snack bar after copying a labeled value.
  ///
  /// In en, this message translates to:
  /// **'{label} copied'**
  String commonLabelCopied(String label);

  /// Snack bar when attachment cannot be opened.
  ///
  /// In en, this message translates to:
  /// **'Unable to open this attachment.'**
  String get attachmentUnableToOpen;

  /// Snack bar when report has no link.
  ///
  /// In en, this message translates to:
  /// **'No report link to copy.'**
  String get parentReportNoLinkToCopy;

  /// Snack bar when report file is missing.
  ///
  /// In en, this message translates to:
  /// **'No report file available yet.'**
  String get parentReportNoFileAvailable;

  /// Snack bar when report link is invalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid report link.'**
  String get parentReportInvalidLink;

  /// Snack bar after copying report link.
  ///
  /// In en, this message translates to:
  /// **'Report link copied to clipboard.'**
  String get parentReportLinkCopied;

  /// Snack bar when report open fails but link was copied.
  ///
  /// In en, this message translates to:
  /// **'Could not open report. Link copied to clipboard.'**
  String get parentReportOpenFailedLinkCopied;

  /// Title for admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Edit Session'**
  String get adminSessionsEditTitle;

  /// Patient label in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Patient: {name}'**
  String adminSessionsPatientLabel(String name);

  /// Date field label in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Date (YYYY-MM-DD)'**
  String get adminSessionsDateField;

  /// Time field label in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Time (HH:MM)'**
  String get adminSessionsTimeField;

  /// Location field label in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Location / Link'**
  String get adminSessionsLocationField;

  /// Status field label in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get adminSessionsStatusField;

  /// Cancellation reason field in admin edit session dialog.
  ///
  /// In en, this message translates to:
  /// **'Cancellation reason'**
  String get adminSessionsCancellationReasonField;

  /// Validation when session status cannot be edited.
  ///
  /// In en, this message translates to:
  /// **'Status is final and cannot be changed.'**
  String get adminSessionsStatusFinal;

  /// Validation for invalid session date/time.
  ///
  /// In en, this message translates to:
  /// **'Invalid date or time.'**
  String get adminSessionsInvalidDateTime;

  /// Snack bar after admin updates a session.
  ///
  /// In en, this message translates to:
  /// **'Session updated successfully.'**
  String get adminSessionsUpdatedSuccess;

  /// Generic admin session action failure.
  ///
  /// In en, this message translates to:
  /// **'Action failed: {error}'**
  String adminSessionsActionFailed(String error);

  /// Snack bar after admin updates a patient.
  ///
  /// In en, this message translates to:
  /// **'Patient updated successfully.'**
  String get adminPatientsUpdatedSuccess;

  /// Empty state when patient is missing.
  ///
  /// In en, this message translates to:
  /// **'Patient not found.'**
  String get adminPatientsNotFound;

  /// Fallback when optional patient field is empty.
  ///
  /// In en, this message translates to:
  /// **'Not specified'**
  String get adminPatientsNotSpecified;

  /// Hint for date of birth picker.
  ///
  /// In en, this message translates to:
  /// **'Select date of birth'**
  String get adminPatientsSelectDateOfBirth;

  /// Button to open patient assignments.
  ///
  /// In en, this message translates to:
  /// **'Patient Assignments'**
  String get adminPatientsAssignments;

  /// Snack bar after deactivating a user.
  ///
  /// In en, this message translates to:
  /// **'User deactivated.'**
  String get adminUsersUserDeactivated;

  /// Snack bar after activating a user.
  ///
  /// In en, this message translates to:
  /// **'User activated.'**
  String get adminUsersUserActivated;

  /// Title for add user dialog.
  ///
  /// In en, this message translates to:
  /// **'Add User'**
  String get adminUsersAddUserTitle;

  /// Title for edit user dialog.
  ///
  /// In en, this message translates to:
  /// **'Edit User'**
  String get adminUsersEditUserTitle;

  /// Password field label in user dialog.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get adminUsersPasswordField;

  /// Optional phone field in user dialog.
  ///
  /// In en, this message translates to:
  /// **'Phone (optional)'**
  String get adminUsersPhoneOptional;

  /// Role dropdown label in user dialog.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get adminUsersRoleField;

  /// Validation when required user fields are missing.
  ///
  /// In en, this message translates to:
  /// **'Please complete all required fields.'**
  String get adminUsersValidationRequired;

  /// Snack bar after creating a user.
  ///
  /// In en, this message translates to:
  /// **'User created successfully.'**
  String get adminUsersCreatedSuccess;

  /// Snack bar after updating a user.
  ///
  /// In en, this message translates to:
  /// **'User updated successfully.'**
  String get adminUsersUpdatedSuccess;

  /// Title for specialist matching screen.
  ///
  /// In en, this message translates to:
  /// **'Choose Specialist'**
  String get adminMatchingChooseSpecialist;

  /// Loading state on matching screen.
  ///
  /// In en, this message translates to:
  /// **'Loading matching specialists...'**
  String get adminMatchingLoadingSpecialists;

  /// Button label while assigning specialist.
  ///
  /// In en, this message translates to:
  /// **'Assigning...'**
  String get adminMatchingAssigning;

  /// Empty state when no specialists match.
  ///
  /// In en, this message translates to:
  /// **'No matching specialists found.'**
  String get adminMatchingNoSpecialists;

  /// Instruction on matching screen.
  ///
  /// In en, this message translates to:
  /// **'Select a specialist to assign to this case.'**
  String get adminMatchingSelectSpecialist;

  /// Confirmation dialog body for assignment.
  ///
  /// In en, this message translates to:
  /// **'Assign this specialist to the case request?'**
  String get adminMatchingConfirmBody;

  /// Snack bar after successful assignment.
  ///
  /// In en, this message translates to:
  /// **'Specialist assigned successfully.'**
  String get adminMatchingAssignedSuccess;

  /// Snack bar while assignment is processing.
  ///
  /// In en, this message translates to:
  /// **'Please wait while the assignment is processed.'**
  String get adminMatchingWaitForAssignment;

  /// Snack bar after specialist profile update.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully.'**
  String get specialistProfileUpdatedSuccess;

  /// Personal section heading on the edit specialist profile form.
  ///
  /// In en, this message translates to:
  /// **'Personal'**
  String get specialistProfilePersonalSection;

  /// Professional section heading on the edit specialist profile form.
  ///
  /// In en, this message translates to:
  /// **'Professional'**
  String get specialistProfileProfessionalSection;

  /// Empty state when report is missing.
  ///
  /// In en, this message translates to:
  /// **'Report not found.'**
  String get specialistReportNotFound;

  /// Title for report details screen.
  ///
  /// In en, this message translates to:
  /// **'Report Details'**
  String get specialistReportDetailsTitle;

  /// Attachments section heading on report details.
  ///
  /// In en, this message translates to:
  /// **'Attachments'**
  String get specialistReportAttachments;

  /// Button to view report PDF.
  ///
  /// In en, this message translates to:
  /// **'View PDF'**
  String get specialistReportViewPdf;

  /// Button to copy report PDF link.
  ///
  /// In en, this message translates to:
  /// **'Copy PDF Link'**
  String get specialistReportCopyPdfLink;

  /// Snack bar after copying PDF link.
  ///
  /// In en, this message translates to:
  /// **'PDF link copied to clipboard'**
  String get specialistReportPdfLinkCopied;

  /// Snack bar after PDF generation.
  ///
  /// In en, this message translates to:
  /// **'PDF generated successfully'**
  String get specialistReportPdfGeneratedSuccess;

  /// Button label while generating PDF.
  ///
  /// In en, this message translates to:
  /// **'Generating PDF...'**
  String get specialistReportGeneratingPdf;

  /// Button to generate report PDF.
  ///
  /// In en, this message translates to:
  /// **'Generate PDF'**
  String get specialistReportGeneratePdf;

  /// Badge when an AI/regular report PDF is ready.
  ///
  /// In en, this message translates to:
  /// **'PDF Ready'**
  String get specialistReportStatusPdfReady;

  /// Badge when an AI report is waiting for specialist review before PDF export.
  ///
  /// In en, this message translates to:
  /// **'Awaiting Review'**
  String get specialistReportStatusAwaitingReview;

  /// Helper banner on AI report details while awaiting review.
  ///
  /// In en, this message translates to:
  /// **'This AI report is awaiting specialist review. Approve it to generate a PDF, or discard the draft.'**
  String get specialistReportReviewBanner;

  /// Primary action to approve an AI draft and export its PDF.
  ///
  /// In en, this message translates to:
  /// **'Approve & Generate PDF'**
  String get specialistReportApproveAndGeneratePdf;

  /// Loading label while approving and exporting an AI report PDF.
  ///
  /// In en, this message translates to:
  /// **'Approving & generating PDF...'**
  String get specialistReportApprovingPdf;

  /// Snack bar after approving an AI report and generating its PDF.
  ///
  /// In en, this message translates to:
  /// **'Report approved and PDF generated successfully.'**
  String get specialistReportApprovedSuccess;

  /// Secondary action to discard an AI report draft.
  ///
  /// In en, this message translates to:
  /// **'Discard Report'**
  String get specialistReportDiscard;

  /// Title for discard confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'Discard AI report?'**
  String get specialistReportDiscardConfirmTitle;

  /// Body for discard confirmation dialog.
  ///
  /// In en, this message translates to:
  /// **'This will permanently remove the AI-generated draft. This action cannot be undone.'**
  String get specialistReportDiscardConfirmBody;

  /// Confirm button on discard dialog.
  ///
  /// In en, this message translates to:
  /// **'Discard'**
  String get specialistReportDiscardConfirmAction;

  /// Loading label while discarding an AI report.
  ///
  /// In en, this message translates to:
  /// **'Discarding...'**
  String get specialistReportDiscarding;

  /// Snack bar after discarding an AI report.
  ///
  /// In en, this message translates to:
  /// **'AI report discarded.'**
  String get specialistReportDiscardSuccess;

  /// Snack bar when discard fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to discard AI report.'**
  String get specialistReportDiscardFailed;

  /// Action to edit an AI report draft before approval.
  ///
  /// In en, this message translates to:
  /// **'Edit Report'**
  String get specialistReportEditReport;

  /// Banner shown while editing an AI report draft.
  ///
  /// In en, this message translates to:
  /// **'Editing Report'**
  String get specialistReportEditingBanner;

  /// Save edited AI report draft.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get specialistReportSaveChanges;

  /// Loading label while saving AI report draft edits.
  ///
  /// In en, this message translates to:
  /// **'Saving changes...'**
  String get specialistReportSavingChanges;

  /// Cancel unsaved AI report draft edits.
  ///
  /// In en, this message translates to:
  /// **'Cancel Editing'**
  String get specialistReportCancelEditing;

  /// Snack bar after saving AI report draft edits.
  ///
  /// In en, this message translates to:
  /// **'Changes saved successfully'**
  String get specialistReportSaveChangesSuccess;

  /// Snack bar when saving AI report draft edits fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save changes'**
  String get specialistReportSaveChangesFailed;

  /// Validation when all draft fields are empty.
  ///
  /// In en, this message translates to:
  /// **'Report content cannot be empty.'**
  String get specialistReportEditEmptyContent;

  /// Hint for list fields in AI report edit mode.
  ///
  /// In en, this message translates to:
  /// **'Enter one item per line.'**
  String get specialistReportEditListHint;

  /// No description provided for @specialistAiReportSectionExecutiveSummary.
  ///
  /// In en, this message translates to:
  /// **'Executive Summary'**
  String get specialistAiReportSectionExecutiveSummary;

  /// No description provided for @specialistAiReportSectionPatientProgress.
  ///
  /// In en, this message translates to:
  /// **'Patient Progress Summary'**
  String get specialistAiReportSectionPatientProgress;

  /// No description provided for @specialistAiReportSectionSpeechAnalysis.
  ///
  /// In en, this message translates to:
  /// **'Speech Analysis Summary'**
  String get specialistAiReportSectionSpeechAnalysis;

  /// No description provided for @specialistAiReportSectionExerciseAdherence.
  ///
  /// In en, this message translates to:
  /// **'Exercise Adherence Summary'**
  String get specialistAiReportSectionExerciseAdherence;

  /// No description provided for @specialistAiReportSectionGoalProgress.
  ///
  /// In en, this message translates to:
  /// **'Goal Progress Summary'**
  String get specialistAiReportSectionGoalProgress;

  /// No description provided for @specialistAiReportSectionClinicalInsights.
  ///
  /// In en, this message translates to:
  /// **'Clinical Insights'**
  String get specialistAiReportSectionClinicalInsights;

  /// No description provided for @specialistAiReportSectionRisks.
  ///
  /// In en, this message translates to:
  /// **'Risks or Regressions'**
  String get specialistAiReportSectionRisks;

  /// No description provided for @specialistAiReportSectionRecommendations.
  ///
  /// In en, this message translates to:
  /// **'Recommendations'**
  String get specialistAiReportSectionRecommendations;

  /// No description provided for @specialistAiReportSectionNextSteps.
  ///
  /// In en, this message translates to:
  /// **'Next Steps'**
  String get specialistAiReportSectionNextSteps;

  /// Snack bar after AI generation when opening the review details screen.
  ///
  /// In en, this message translates to:
  /// **'AI report generated. Please review it before creating a PDF.'**
  String get specialistGenerateAiReportSuccessReview;

  /// Action that opens the AI report generation sheet.
  ///
  /// In en, this message translates to:
  /// **'Generate AI Report'**
  String get specialistGenerateAiReport;

  /// Helper text on the generate AI report sheet.
  ///
  /// In en, this message translates to:
  /// **'Create a weekly or monthly AI report from the patient\'s clinical progress data.'**
  String get specialistGenerateAiReportSubtitle;

  /// Section label for weekly or monthly AI report type.
  ///
  /// In en, this message translates to:
  /// **'Report Type'**
  String get specialistAiReportTypeLabel;

  /// Section label for AI report from/to dates.
  ///
  /// In en, this message translates to:
  /// **'Report Period'**
  String get specialistAiReportPeriodLabel;

  /// Start date field on the generate AI report sheet.
  ///
  /// In en, this message translates to:
  /// **'From'**
  String get specialistAiReportPeriodFrom;

  /// End date field on the generate AI report sheet.
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get specialistAiReportPeriodTo;

  /// Primary action to submit AI report generation.
  ///
  /// In en, this message translates to:
  /// **'Generate Report'**
  String get specialistGenerateAiReportSubmit;

  /// Button label while an AI report is being generated.
  ///
  /// In en, this message translates to:
  /// **'Generating...'**
  String get specialistGenerateAiReportGenerating;

  /// Snack bar after successful AI report generation.
  ///
  /// In en, this message translates to:
  /// **'AI report generated successfully.'**
  String get specialistGenerateAiReportSuccess;

  /// Validation when no patient is selected.
  ///
  /// In en, this message translates to:
  /// **'Patient is required.'**
  String get specialistAiReportPatientRequired;

  /// Validation when report type is missing.
  ///
  /// In en, this message translates to:
  /// **'Report type must be weekly or monthly.'**
  String get specialistAiReportTypeRequired;

  /// Validation when the from date is missing.
  ///
  /// In en, this message translates to:
  /// **'Start date is required.'**
  String get specialistAiReportStartRequired;

  /// Validation when the to date is missing.
  ///
  /// In en, this message translates to:
  /// **'End date is required.'**
  String get specialistAiReportEndRequired;

  /// Validation when from date is after to date.
  ///
  /// In en, this message translates to:
  /// **'period_start cannot be after period_end'**
  String get specialistAiReportStartAfterEnd;

  /// Validation when the to date is in the future.
  ///
  /// In en, this message translates to:
  /// **'Cannot generate report for a period that has not ended yet'**
  String get specialistAiReportPeriodNotEnded;

  /// Title and action for the specialist regular report creation sheet.
  ///
  /// In en, this message translates to:
  /// **'Create Report'**
  String get specialistCreateReport;

  /// Helper text on the create regular report sheet.
  ///
  /// In en, this message translates to:
  /// **'Create a clinical report for one of your assigned patients.'**
  String get specialistCreateReportSubtitle;

  /// Optional title field on the create regular report sheet.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get specialistCreateReportTitleLabel;

  /// Optional summary field on the create regular report sheet.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get specialistCreateReportSummaryLabel;

  /// Button label while a regular report is being created.
  ///
  /// In en, this message translates to:
  /// **'Creating...'**
  String get specialistCreateReportCreating;

  /// Snack bar after successful regular report creation.
  ///
  /// In en, this message translates to:
  /// **'Report created successfully.'**
  String get specialistCreateReportSuccess;

  /// Validation when regular report type is missing.
  ///
  /// In en, this message translates to:
  /// **'report_type must be weekly, monthly, assessment, or progress'**
  String get specialistRegularReportTypeRequired;

  /// Validation when the optional report title exceeds 200 characters.
  ///
  /// In en, this message translates to:
  /// **'title must be 200 characters or fewer'**
  String get specialistCreateReportTitleMaxLength;

  /// Title for AI recommendations screen.
  ///
  /// In en, this message translates to:
  /// **'AI Recommendations'**
  String get specialistAiRecommendationsTitle;

  /// Snack bar after generating recommendation.
  ///
  /// In en, this message translates to:
  /// **'AI recommendation generated'**
  String get specialistAiRecommendationGenerated;

  /// Snack bar after accepting recommendation.
  ///
  /// In en, this message translates to:
  /// **'Recommendation accepted'**
  String get specialistAiRecommendationAccepted;

  /// Primary action to assign/accept a pending AI recommendation.
  ///
  /// In en, this message translates to:
  /// **'Assign'**
  String get specialistAiRecommendationAssign;

  /// Loading label while assigning an AI recommendation.
  ///
  /// In en, this message translates to:
  /// **'Assigning...'**
  String get specialistAiRecommendationAssigning;

  /// Snack bar after rejecting recommendation.
  ///
  /// In en, this message translates to:
  /// **'Recommendation rejected'**
  String get specialistAiRecommendationRejected;

  /// Action to edit a pending AI recommendation before assign/reject.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get specialistAiRecommendationEdit;

  /// Banner shown while editing an AI recommendation draft.
  ///
  /// In en, this message translates to:
  /// **'Editing Recommendation'**
  String get specialistAiRecommendationEditingBanner;

  /// Save edited AI recommendation draft.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get specialistAiRecommendationSaveChanges;

  /// Loading label while saving AI recommendation edits.
  ///
  /// In en, this message translates to:
  /// **'Saving changes...'**
  String get specialistAiRecommendationSavingChanges;

  /// Cancel AI recommendation draft editing.
  ///
  /// In en, this message translates to:
  /// **'Cancel Editing'**
  String get specialistAiRecommendationCancelEditing;

  /// Snack bar after saving AI recommendation edits.
  ///
  /// In en, this message translates to:
  /// **'Changes saved successfully'**
  String get specialistAiRecommendationSaveChangesSuccess;

  /// Snack bar when AI recommendation draft save fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to save changes'**
  String get specialistAiRecommendationSaveChangesFailed;

  /// Validation when all recommendation draft fields are empty.
  ///
  /// In en, this message translates to:
  /// **'Recommendation content cannot be empty.'**
  String get specialistAiRecommendationEditEmptyContent;

  /// Hint for plan adjustment list field in edit mode.
  ///
  /// In en, this message translates to:
  /// **'Enter one item per line.'**
  String get specialistAiRecommendationEditListHint;

  /// Hint for suggested exercises field in edit mode.
  ///
  /// In en, this message translates to:
  /// **'Enter one exercise per line as Title — Reason.'**
  String get specialistAiRecommendationEditExerciseHint;

  /// Empty state CTA on AI recommendations screen.
  ///
  /// In en, this message translates to:
  /// **'Generate your first AI recommendation'**
  String get specialistAiGenerateFirstRecommendation;

  /// Dev-only dashboard preview hub title.
  ///
  /// In en, this message translates to:
  /// **'Dashboard Previews'**
  String get devDashboardPreviewsTitle;

  /// Disclaimer on the parent case requests list screen.
  ///
  /// In en, this message translates to:
  /// **'These are preliminary requests, not official diagnoses. The admin team reviews each request and assigns a suitable specialist.'**
  String get parentCaseRequestsListDisclaimer;

  /// Empty state title on case requests list.
  ///
  /// In en, this message translates to:
  /// **'No case requests yet.'**
  String get parentCaseRequestsEmptyTitle;

  /// Empty state message on case requests list.
  ///
  /// In en, this message translates to:
  /// **'Submit a request so the admin team can review the case and assign a suitable specialist.'**
  String get parentCaseRequestsEmptyMessage;

  /// Fallback when case request submitted date is missing.
  ///
  /// In en, this message translates to:
  /// **'Date unavailable'**
  String get parentCaseRequestsDateUnavailable;

  /// Error when parent is not signed in on case requests.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view case requests.'**
  String get parentCaseRequestsSignInRequired;

  /// Error when loading case requests fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load case requests: {error}'**
  String parentCaseRequestsLoadFailed(String error);

  /// Error when refreshing case requests fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to refresh case requests: {error}'**
  String parentCaseRequestsRefreshFailed(String error);

  /// Title for new case request form.
  ///
  /// In en, this message translates to:
  /// **'New Case Request'**
  String get parentCaseRequestFormNewTitle;

  /// Title for edit case request form.
  ///
  /// In en, this message translates to:
  /// **'Edit Case Request'**
  String get parentCaseRequestFormEditTitle;

  /// Title for discard changes dialog.
  ///
  /// In en, this message translates to:
  /// **'Discard changes?'**
  String get parentCaseRequestFormDiscardTitle;

  /// Body for discard changes dialog.
  ///
  /// In en, this message translates to:
  /// **'You have unsaved changes. Leave this form without saving?'**
  String get parentCaseRequestFormDiscardMessage;

  /// Stay on form button in discard dialog.
  ///
  /// In en, this message translates to:
  /// **'Stay'**
  String get parentCaseRequestFormStay;

  /// Leave form button in discard dialog.
  ///
  /// In en, this message translates to:
  /// **'Leave'**
  String get parentCaseRequestFormLeave;

  /// Error when edit form cannot load request.
  ///
  /// In en, this message translates to:
  /// **'Failed to load request for editing.'**
  String get parentCaseRequestFormLoadFailed;

  /// Error when non-pending request is opened for edit.
  ///
  /// In en, this message translates to:
  /// **'Only pending requests can be edited.'**
  String get parentCaseRequestFormOnlyPendingEditable;

  /// Snack bar after case request update.
  ///
  /// In en, this message translates to:
  /// **'Case request updated successfully.'**
  String get parentCaseRequestFormUpdatedSuccess;

  /// Snack bar after case request submission.
  ///
  /// In en, this message translates to:
  /// **'Case request submitted successfully.'**
  String get parentCaseRequestFormSubmittedSuccess;

  /// Snack bar when child photo selection fails.
  ///
  /// In en, this message translates to:
  /// **'Unable to select image: {error}'**
  String parentCaseRequestFormImageSelectFailed(String error);

  /// Primary submit button on case request form.
  ///
  /// In en, this message translates to:
  /// **'Submit Case Request'**
  String get parentCaseRequestFormSubmitRequest;

  /// Submit button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get parentCaseRequestFormSubmitting;

  /// Child information section title on form.
  ///
  /// In en, this message translates to:
  /// **'Child Information'**
  String get parentCaseRequestFormChildInfoSection;

  /// Action to change child photo on form.
  ///
  /// In en, this message translates to:
  /// **'Change child photo'**
  String get parentCaseRequestFormChangeChildPhoto;

  /// Action to add child photo on form.
  ///
  /// In en, this message translates to:
  /// **'Add child photo'**
  String get parentCaseRequestFormAddChildPhoto;

  /// Action to remove child photo on form.
  ///
  /// In en, this message translates to:
  /// **'Remove photo'**
  String get parentCaseRequestFormRemovePhoto;

  /// Child name field label on form.
  ///
  /// In en, this message translates to:
  /// **'Child name'**
  String get parentCaseRequestFormChildName;

  /// Guidance text on category selection step.
  ///
  /// In en, this message translates to:
  /// **'Choose the category closest to the observed difficulty. The specialist will confirm the case after assessment.'**
  String get parentCaseRequestFormCategoryGuidance;

  /// Case description section title on form.
  ///
  /// In en, this message translates to:
  /// **'Case Description'**
  String get parentCaseRequestFormCaseDescriptionSection;

  /// Case description field label on form.
  ///
  /// In en, this message translates to:
  /// **'Case description'**
  String get parentCaseRequestFormCaseDescriptionLabel;

  /// Helper text for case description field.
  ///
  /// In en, this message translates to:
  /// **'Required. Up to {max} characters.'**
  String parentCaseRequestFormCaseDescriptionHelper(int max);

  /// Observed difficulties field label on form.
  ///
  /// In en, this message translates to:
  /// **'Observed difficulties'**
  String get parentCaseRequestFormObservedDifficultiesLabel;

  /// Helper text for observed difficulties field.
  ///
  /// In en, this message translates to:
  /// **'Optional. Up to {max} characters.'**
  String parentCaseRequestFormObservedDifficultiesHelper(int max);

  /// Toggle label for previous diagnosis on form.
  ///
  /// In en, this message translates to:
  /// **'Has previous diagnosis?'**
  String get parentCaseRequestFormHasPreviousDiagnosis;

  /// Previous diagnosis details field label.
  ///
  /// In en, this message translates to:
  /// **'Previous diagnosis details'**
  String get parentCaseRequestFormPreviousDiagnosisDetails;

  /// Toggle label for current treatment on form.
  ///
  /// In en, this message translates to:
  /// **'Currently receiving treatment?'**
  String get parentCaseRequestFormCurrentlyReceivingTreatment;

  /// Current treatment details field label.
  ///
  /// In en, this message translates to:
  /// **'Current treatment details'**
  String get parentCaseRequestFormCurrentTreatmentDetails;

  /// Helper text on medical history step.
  ///
  /// In en, this message translates to:
  /// **'Provide as much detail as you can to help the specialist prepare.'**
  String get parentCaseRequestFormHistoryHelper;

  /// Preferred contact period section title.
  ///
  /// In en, this message translates to:
  /// **'Preferred Contact Period'**
  String get parentCaseRequestFormPreferredContactPeriod;

  /// Review step title on case request form.
  ///
  /// In en, this message translates to:
  /// **'Review and Submit'**
  String get parentCaseRequestFormReviewTitle;

  /// Review row label for child name.
  ///
  /// In en, this message translates to:
  /// **'Child name'**
  String get parentCaseRequestFormReviewChildName;

  /// Review row label for date of birth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get parentCaseRequestFormReviewDob;

  /// Review row label for gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get parentCaseRequestFormReviewGender;

  /// Review row label for category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get parentCaseRequestFormReviewCategory;

  /// Review row label for case description.
  ///
  /// In en, this message translates to:
  /// **'Case description'**
  String get parentCaseRequestFormReviewCaseDescription;

  /// Review row label for observed difficulties.
  ///
  /// In en, this message translates to:
  /// **'Observed difficulties'**
  String get parentCaseRequestFormReviewObservedDifficulties;

  /// Review row label for previous diagnosis.
  ///
  /// In en, this message translates to:
  /// **'Previous diagnosis'**
  String get parentCaseRequestFormReviewPreviousDiagnosis;

  /// Review row label for current treatment.
  ///
  /// In en, this message translates to:
  /// **'Current treatment'**
  String get parentCaseRequestFormReviewCurrentTreatment;

  /// Review row label for preferred contact period.
  ///
  /// In en, this message translates to:
  /// **'Preferred contact'**
  String get parentCaseRequestFormReviewPreferredContact;

  /// Fallback when no option is selected on form.
  ///
  /// In en, this message translates to:
  /// **'Not selected'**
  String get parentCaseRequestFormNotSelected;

  /// Fallback when a value is not set on review step.
  ///
  /// In en, this message translates to:
  /// **'Not set'**
  String get parentCaseRequestFormNotSet;

  /// Fallback when gender or similar value is missing.
  ///
  /// In en, this message translates to:
  /// **'Not specified'**
  String get parentCaseRequestFormNotSpecified;

  /// Fallback when optional text field is empty on review.
  ///
  /// In en, this message translates to:
  /// **'None provided'**
  String get parentCaseRequestFormNoneProvided;

  /// Form step label for child information.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get parentCaseRequestFormStepChild;

  /// Form step label for category selection.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get parentCaseRequestFormStepCategory;

  /// Form step label for case description.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get parentCaseRequestFormStepDescription;

  /// Form step label for medical history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get parentCaseRequestFormStepHistory;

  /// Form step label for contact preferences.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get parentCaseRequestFormStepContact;

  /// Form step label for review and submit.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get parentCaseRequestFormStepReview;

  /// Form step progress label.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}: {stepName}'**
  String parentCaseRequestFormStepProgress(
    int current,
    int total,
    String stepName,
  );

  /// Validation when child name is empty.
  ///
  /// In en, this message translates to:
  /// **'Child name is required.'**
  String get parentCaseRequestFormValidationChildNameRequired;

  /// Validation when child name is too long.
  ///
  /// In en, this message translates to:
  /// **'Child name must not exceed {max} characters.'**
  String parentCaseRequestFormValidationChildNameMax(int max);

  /// Validation when date of birth is missing.
  ///
  /// In en, this message translates to:
  /// **'Date of birth is required.'**
  String get parentCaseRequestFormValidationDobRequired;

  /// Validation when date of birth is in the future.
  ///
  /// In en, this message translates to:
  /// **'Date of birth cannot be in the future.'**
  String get parentCaseRequestFormValidationDobFuture;

  /// Validation when gender is missing.
  ///
  /// In en, this message translates to:
  /// **'Gender is required.'**
  String get parentCaseRequestFormValidationGenderRequired;

  /// Validation when category is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a case category.'**
  String get parentCaseRequestFormValidationCategoryRequired;

  /// Validation when case description is empty.
  ///
  /// In en, this message translates to:
  /// **'Case description is required.'**
  String get parentCaseRequestFormValidationDescriptionRequired;

  /// Validation when case description is too long.
  ///
  /// In en, this message translates to:
  /// **'Case description must not exceed {max} characters.'**
  String parentCaseRequestFormValidationDescriptionMax(int max);

  /// Validation when observed difficulties text is too long.
  ///
  /// In en, this message translates to:
  /// **'Observed difficulties must not exceed {max} characters.'**
  String parentCaseRequestFormValidationObservedMax(int max);

  /// Validation when previous diagnosis details are too long.
  ///
  /// In en, this message translates to:
  /// **'Previous diagnosis details must not exceed {max} characters.'**
  String parentCaseRequestFormValidationPreviousDiagnosisMax(int max);

  /// Validation when current treatment details are too long.
  ///
  /// In en, this message translates to:
  /// **'Current treatment details must not exceed {max} characters.'**
  String parentCaseRequestFormValidationCurrentTreatmentMax(int max);

  /// Validation when contact period is missing.
  ///
  /// In en, this message translates to:
  /// **'Please choose a preferred contact period.'**
  String get parentCaseRequestFormValidationContactPeriodRequired;

  /// Error when case categories fail to load on form.
  ///
  /// In en, this message translates to:
  /// **'Failed to load categories: {error}'**
  String parentCaseRequestFormCategoriesLoadFailed(String error);

  /// Error when case categories fail to refresh on form.
  ///
  /// In en, this message translates to:
  /// **'Failed to refresh categories: {error}'**
  String parentCaseRequestFormCategoriesRefreshFailed(String error);

  /// Title for case request details screen.
  ///
  /// In en, this message translates to:
  /// **'Request Details'**
  String get parentCaseRequestDetailsTitle;

  /// Tooltip for edit request action.
  ///
  /// In en, this message translates to:
  /// **'Edit request'**
  String get parentCaseRequestDetailsEditTooltip;

  /// Error when case request details are missing.
  ///
  /// In en, this message translates to:
  /// **'Case request not found.'**
  String get parentCaseRequestDetailsNotFound;

  /// Fallback when submitted date is unavailable on details.
  ///
  /// In en, this message translates to:
  /// **'Unavailable'**
  String get parentCaseRequestDetailsUnavailable;

  /// Progress section title on request details.
  ///
  /// In en, this message translates to:
  /// **'Request Progress'**
  String get parentCaseRequestDetailsProgressTitle;

  /// Progress step label for submission.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get parentCaseRequestDetailsProgressStepSubmitted;

  /// Progress step label for admin review.
  ///
  /// In en, this message translates to:
  /// **'Admin Review'**
  String get parentCaseRequestDetailsProgressStepAdminReview;

  /// Progress step label for specialist assignment.
  ///
  /// In en, this message translates to:
  /// **'Specialist Assigned'**
  String get parentCaseRequestDetailsProgressStepSpecialistAssigned;

  /// Progress step label for assessment.
  ///
  /// In en, this message translates to:
  /// **'Assessment'**
  String get parentCaseRequestDetailsProgressStepAssessment;

  /// Progress step label for acceptance.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get parentCaseRequestDetailsProgressStepAccepted;

  /// Progress step label for patient profile creation.
  ///
  /// In en, this message translates to:
  /// **'Patient Profile Created'**
  String get parentCaseRequestDetailsProgressStepPatientProfileCreated;

  /// Title for rejected request card on details.
  ///
  /// In en, this message translates to:
  /// **'Request Not Accepted'**
  String get parentCaseRequestDetailsNotAcceptedTitle;

  /// Title when case converted to patient profile.
  ///
  /// In en, this message translates to:
  /// **'Child Profile Active'**
  String get parentCaseRequestDetailsChildProfileActiveTitle;

  /// Message when case converted to patient profile.
  ///
  /// In en, this message translates to:
  /// **'The child profile is now active and ready for follow-up.'**
  String get parentCaseRequestDetailsChildProfileActiveMessage;

  /// Button to open child profile after conversion.
  ///
  /// In en, this message translates to:
  /// **'Open Child Profile'**
  String get parentCaseRequestDetailsOpenChildProfile;

  /// Child information section title on details.
  ///
  /// In en, this message translates to:
  /// **'Child Information'**
  String get parentCaseRequestDetailsChildInformation;

  /// Case description row label on details.
  ///
  /// In en, this message translates to:
  /// **'Case description'**
  String get parentCaseRequestDetailsCaseDescription;

  /// Observed difficulties row label on details.
  ///
  /// In en, this message translates to:
  /// **'Observed difficulties'**
  String get parentCaseRequestDetailsObservedDifficulties;

  /// Previous diagnosis row label on details.
  ///
  /// In en, this message translates to:
  /// **'Previous diagnosis'**
  String get parentCaseRequestDetailsPreviousDiagnosis;

  /// Current treatment row label on details.
  ///
  /// In en, this message translates to:
  /// **'Current treatment'**
  String get parentCaseRequestDetailsCurrentTreatment;

  /// Preferred contact period row label on details.
  ///
  /// In en, this message translates to:
  /// **'Preferred contact period'**
  String get parentCaseRequestDetailsPreferredContactPeriod;

  /// Assigned specialist section title on details.
  ///
  /// In en, this message translates to:
  /// **'Assigned Specialist'**
  String get parentCaseRequestDetailsAssignedSpecialist;

  /// Attachments section title on details.
  ///
  /// In en, this message translates to:
  /// **'Attachments'**
  String get parentCaseRequestDetailsAttachments;

  /// Hint for supported attachment types.
  ///
  /// In en, this message translates to:
  /// **'Supported: image, audio, video, PDF'**
  String get parentCaseRequestDetailsAttachmentsHint;

  /// Empty state for attachments on details.
  ///
  /// In en, this message translates to:
  /// **'No attachments yet.'**
  String get parentCaseRequestDetailsNoAttachments;

  /// Button to add attachment on details.
  ///
  /// In en, this message translates to:
  /// **'Add Attachment'**
  String get parentCaseRequestDetailsAddAttachment;

  /// Snack bar after attachment upload.
  ///
  /// In en, this message translates to:
  /// **'Attachment uploaded successfully'**
  String get parentCaseRequestDetailsAttachmentUploaded;

  /// Snack bar after attachment deletion.
  ///
  /// In en, this message translates to:
  /// **'Attachment deleted'**
  String get parentCaseRequestDetailsAttachmentDeleted;

  /// Title for delete attachment dialog.
  ///
  /// In en, this message translates to:
  /// **'Delete attachment?'**
  String get parentCaseRequestDetailsDeleteAttachmentTitle;

  /// Body for delete attachment dialog.
  ///
  /// In en, this message translates to:
  /// **'Remove \"{name}\" from this request?'**
  String parentCaseRequestDetailsDeleteAttachmentMessage(String name);

  /// Error when loading case request details fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load case request: {error}'**
  String parentCaseRequestDetailsLoadFailed(String error);

  /// Error when refreshing case request details fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to refresh case request: {error}'**
  String parentCaseRequestDetailsRefreshFailed(String error);

  /// Error when submitting case request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit case request: {error}'**
  String parentCaseRequestDetailsSubmitFailed(String error);

  /// Error when updating case request fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update case request: {error}'**
  String parentCaseRequestDetailsUpdateFailed(String error);

  /// Error when child image upload fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload child image: {error}'**
  String parentCaseRequestDetailsUploadChildImageFailed(String error);

  /// Error when attachment upload fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload attachment: {error}'**
  String parentCaseRequestDetailsUploadAttachmentFailed(String error);

  /// Error when attachment deletion fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete attachment: {error}'**
  String parentCaseRequestDetailsDeleteAttachmentFailed(String error);

  /// Case intake status label for pending review.
  ///
  /// In en, this message translates to:
  /// **'Pending Review'**
  String get caseIntakeStatusPending;

  /// Case intake status label for assigned specialist.
  ///
  /// In en, this message translates to:
  /// **'Specialist Assigned'**
  String get caseIntakeStatusAssigned;

  /// Case intake status label for under assessment.
  ///
  /// In en, this message translates to:
  /// **'Under Assessment'**
  String get caseIntakeStatusUnderAssessment;

  /// Case intake status label for accepted case.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get caseIntakeStatusAccepted;

  /// Case intake status label for rejected case.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get caseIntakeStatusRejected;

  /// Case intake status label for converted patient profile.
  ///
  /// In en, this message translates to:
  /// **'Profile Created'**
  String get caseIntakeStatusConvertedToPatient;

  /// Subtitle for pending case intake status.
  ///
  /// In en, this message translates to:
  /// **'Your request is waiting for admin review.'**
  String get caseIntakeStatusPendingSubtitle;

  /// Subtitle for assigned case intake status.
  ///
  /// In en, this message translates to:
  /// **'A specialist has been assigned and will begin reviewing the case.'**
  String get caseIntakeStatusAssignedSubtitle;

  /// Subtitle for under assessment case intake status.
  ///
  /// In en, this message translates to:
  /// **'The assigned specialist is assessing the case.'**
  String get caseIntakeStatusUnderAssessmentSubtitle;

  /// Subtitle for accepted case intake status.
  ///
  /// In en, this message translates to:
  /// **'The case was accepted. Patient profile creation is in progress.'**
  String get caseIntakeStatusAcceptedSubtitle;

  /// Subtitle for rejected case intake status.
  ///
  /// In en, this message translates to:
  /// **'This request was not accepted. See the reason below.'**
  String get caseIntakeStatusRejectedSubtitle;

  /// Subtitle for converted case intake status.
  ///
  /// In en, this message translates to:
  /// **'The case was accepted and the patient profile was created.'**
  String get caseIntakeStatusConvertedToPatientSubtitle;

  /// Attachment type label for PDF files.
  ///
  /// In en, this message translates to:
  /// **'PDF'**
  String get caseIntakeAttachmentPdf;

  /// Intro text on specialist assigned cases list.
  ///
  /// In en, this message translates to:
  /// **'Review assigned cases and track their assessment status.'**
  String get specialistCaseRequestsDescription;

  /// Loading state on specialist assigned cases list.
  ///
  /// In en, this message translates to:
  /// **'Loading assigned case requests...'**
  String get specialistCaseRequestsLoading;

  /// Empty state when specialist has no assigned cases.
  ///
  /// In en, this message translates to:
  /// **'No assigned case requests yet.\nAssigned cases will appear here after an admin selects you for a request.'**
  String get specialistCaseRequestsEmpty;

  /// Error when loading assigned case requests fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to load assigned case requests: {error}'**
  String specialistCaseRequestsLoadFailed(String error);

  /// Assigned date label on specialist case card.
  ///
  /// In en, this message translates to:
  /// **'Assigned {date}'**
  String specialistCaseRequestsAssignedOn(String date);

  /// Fallback when child name is missing on specialist case card.
  ///
  /// In en, this message translates to:
  /// **'Unnamed child'**
  String get specialistCaseRequestsUnnamedChild;

  /// Attachment count label when one attachment exists.
  ///
  /// In en, this message translates to:
  /// **'1 attachment'**
  String get specialistCaseRequestsOneAttachment;

  /// Attachment count label for multiple attachments.
  ///
  /// In en, this message translates to:
  /// **'{count} attachments'**
  String specialistCaseRequestsAttachmentCount(int count);

  /// Meta label when conversation is available.
  ///
  /// In en, this message translates to:
  /// **'Conversation available'**
  String get specialistCaseRequestsConversationAvailable;

  /// Title for specialist case request details screen.
  ///
  /// In en, this message translates to:
  /// **'Case Request'**
  String get specialistCaseRequestDetailsTitle;

  /// Intro text on specialist case request details.
  ///
  /// In en, this message translates to:
  /// **'Review the submitted information before starting the assessment.'**
  String get specialistCaseRequestDetailsReviewIntro;

  /// Loading state on specialist case request details.
  ///
  /// In en, this message translates to:
  /// **'Loading case request...'**
  String get specialistCaseRequestDetailsLoading;

  /// Parent name label on specialist case request header.
  ///
  /// In en, this message translates to:
  /// **'Parent: {name}'**
  String specialistCaseRequestDetailsParentLabel(String name);

  /// Timeline section title on specialist case details.
  ///
  /// In en, this message translates to:
  /// **'Status Timeline'**
  String get specialistCaseRequestDetailsStatusTimeline;

  /// Timeline step label for assignment.
  ///
  /// In en, this message translates to:
  /// **'Assigned'**
  String get specialistCaseRequestDetailsTimelineAssigned;

  /// Timeline step label for assessment.
  ///
  /// In en, this message translates to:
  /// **'Under Assessment'**
  String get specialistCaseRequestDetailsTimelineUnderAssessment;

  /// Timeline step label for acceptance.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get specialistCaseRequestDetailsTimelineAccepted;

  /// Timeline step label for patient conversion.
  ///
  /// In en, this message translates to:
  /// **'Converted'**
  String get specialistCaseRequestDetailsTimelineConverted;

  /// Timeline subtitle when step is in progress.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get specialistCaseRequestDetailsTimelineInProgress;

  /// Rejection reason section title.
  ///
  /// In en, this message translates to:
  /// **'Rejection Reason'**
  String get specialistCaseRequestDetailsRejectionReason;

  /// Success message when patient profile was created.
  ///
  /// In en, this message translates to:
  /// **'Patient profile created successfully.'**
  String get specialistCaseRequestDetailsPatientProfileCreated;

  /// Button to open converted patient profile.
  ///
  /// In en, this message translates to:
  /// **'Open Patient Profile'**
  String get specialistCaseRequestDetailsOpenPatientProfile;

  /// Case information section title.
  ///
  /// In en, this message translates to:
  /// **'Case Information'**
  String get specialistCaseRequestDetailsCaseInformation;

  /// Previous diagnosis and treatment section title.
  ///
  /// In en, this message translates to:
  /// **'Previous Diagnosis & Treatment'**
  String get specialistCaseRequestDetailsPreviousDiagnosisTreatment;

  /// Previous diagnosis details row label.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis details'**
  String get specialistCaseRequestDetailsDiagnosisDetails;

  /// Current treatment details row label.
  ///
  /// In en, this message translates to:
  /// **'Treatment details'**
  String get specialistCaseRequestDetailsTreatmentDetails;

  /// Row label for current treatment status.
  ///
  /// In en, this message translates to:
  /// **'Currently receiving treatment'**
  String get specialistCaseRequestDetailsCurrentlyReceivingTreatment;

  /// Parent information section title.
  ///
  /// In en, this message translates to:
  /// **'Parent Information'**
  String get specialistCaseRequestDetailsParentInformation;

  /// Age row label on child information.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get specialistCaseRequestDetailsAge;

  /// Fallback when age cannot be calculated.
  ///
  /// In en, this message translates to:
  /// **'Unavailable'**
  String get specialistCaseRequestDetailsAgeUnavailable;

  /// Age label for infants under one month.
  ///
  /// In en, this message translates to:
  /// **'Under 1 month'**
  String get specialistCaseRequestDetailsAgeUnderOneMonth;

  /// Age label for one month old.
  ///
  /// In en, this message translates to:
  /// **'1 month'**
  String get specialistCaseRequestDetailsAgeOneMonth;

  /// Age label in months.
  ///
  /// In en, this message translates to:
  /// **'{count} months'**
  String specialistCaseRequestDetailsAgeMonths(int count);

  /// Age label for one year old.
  ///
  /// In en, this message translates to:
  /// **'1 year'**
  String get specialistCaseRequestDetailsAgeOneYear;

  /// Age label in years.
  ///
  /// In en, this message translates to:
  /// **'{count} years'**
  String specialistCaseRequestDetailsAgeYears(int count);

  /// Empty state for attachments on specialist details.
  ///
  /// In en, this message translates to:
  /// **'No attachments'**
  String get specialistCaseRequestDetailsNoAttachments;

  /// Tooltip for copying a contact field.
  ///
  /// In en, this message translates to:
  /// **'Copy {label}'**
  String specialistCaseRequestDetailsCopyLabel(String label);

  /// Title for start assessment dialog.
  ///
  /// In en, this message translates to:
  /// **'Start Assessment'**
  String get specialistCaseAssessmentStartTitle;

  /// Body for start assessment dialog.
  ///
  /// In en, this message translates to:
  /// **'Contact the parent first if you have not already. Start the preliminary assessment for this case?'**
  String get specialistCaseAssessmentStartMessage;

  /// Confirm button to start assessment.
  ///
  /// In en, this message translates to:
  /// **'Start Assessment'**
  String get specialistCaseAssessmentStartAction;

  /// Snack bar after assessment starts.
  ///
  /// In en, this message translates to:
  /// **'Assessment started successfully'**
  String get specialistCaseAssessmentStartedSuccess;

  /// Assessment notes section title.
  ///
  /// In en, this message translates to:
  /// **'Preliminary Assessment Notes'**
  String get specialistCaseAssessmentNotesTitle;

  /// Hint for assessment notes field.
  ///
  /// In en, this message translates to:
  /// **'Enter preliminary assessment notes'**
  String get specialistCaseAssessmentNotesHint;

  /// Validation when assessment notes are empty.
  ///
  /// In en, this message translates to:
  /// **'Assessment notes are required.'**
  String get specialistCaseAssessmentNotesRequired;

  /// Validation when assessment notes are too long.
  ///
  /// In en, this message translates to:
  /// **'Assessment notes must not exceed {max} characters.'**
  String specialistCaseAssessmentNotesMaxLength(int max);

  /// Snack bar after saving assessment notes.
  ///
  /// In en, this message translates to:
  /// **'Assessment notes updated successfully'**
  String get specialistCaseAssessmentNotesUpdatedSuccess;

  /// Button to save assessment notes.
  ///
  /// In en, this message translates to:
  /// **'Save Notes'**
  String get specialistCaseAssessmentSaveNotes;

  /// Title for accept case dialog.
  ///
  /// In en, this message translates to:
  /// **'Accept Case'**
  String get specialistCaseAssessmentAcceptTitle;

  /// Body for accept case dialog.
  ///
  /// In en, this message translates to:
  /// **'Accept this case for continued rehabilitation follow-up?\n\nThe patient profile will not be created yet.'**
  String get specialistCaseAssessmentAcceptMessage;

  /// Confirm button to accept case.
  ///
  /// In en, this message translates to:
  /// **'Accept Case'**
  String get specialistCaseAssessmentAcceptAction;

  /// Snack bar when notes are missing before accept.
  ///
  /// In en, this message translates to:
  /// **'Save assessment notes before accepting this case.'**
  String get specialistCaseAssessmentAcceptNotesRequired;

  /// Snack bar when unsaved notes block accept.
  ///
  /// In en, this message translates to:
  /// **'Save your assessment notes before accepting.'**
  String get specialistCaseAssessmentAcceptSaveNotesFirst;

  /// Snack bar after patient profile creation.
  ///
  /// In en, this message translates to:
  /// **'Patient profile created successfully.'**
  String get specialistCaseAssessmentPatientProfileCreatedSuccess;

  /// Inline progress while creating patient profile.
  ///
  /// In en, this message translates to:
  /// **'Creating patient profile...'**
  String get specialistCaseAssessmentCreatingPatientProfile;

  /// Title for reject case sheet.
  ///
  /// In en, this message translates to:
  /// **'Reject Case'**
  String get specialistCaseAssessmentRejectTitle;

  /// Confirm button to reject case.
  ///
  /// In en, this message translates to:
  /// **'Reject Case'**
  String get specialistCaseAssessmentRejectAction;

  /// Rejection reason field label.
  ///
  /// In en, this message translates to:
  /// **'Reason for rejection'**
  String get specialistCaseAssessmentRejectReasonLabel;

  /// Helper text for rejection reason field.
  ///
  /// In en, this message translates to:
  /// **'This reason will be visible to the parent.'**
  String get specialistCaseAssessmentRejectReasonHelper;

  /// Validation when rejection reason is empty.
  ///
  /// In en, this message translates to:
  /// **'Reason for rejection is required.'**
  String get specialistCaseAssessmentRejectReasonRequired;

  /// Validation when rejection reason is too short.
  ///
  /// In en, this message translates to:
  /// **'Reason must be at least {min} characters.'**
  String specialistCaseAssessmentRejectReasonMinLength(int min);

  /// Validation when rejection reason is too long.
  ///
  /// In en, this message translates to:
  /// **'Reason must not exceed {max} characters.'**
  String specialistCaseAssessmentRejectReasonMaxLength(int max);

  /// Snack bar after rejecting case.
  ///
  /// In en, this message translates to:
  /// **'Case request rejected successfully'**
  String get specialistCaseAssessmentRejectedSuccess;

  /// Inline progress while rejecting case.
  ///
  /// In en, this message translates to:
  /// **'Rejecting...'**
  String get specialistCaseAssessmentRejecting;

  /// Inline progress while starting assessment.
  ///
  /// In en, this message translates to:
  /// **'Starting...'**
  String get specialistCaseAssessmentStarting;

  /// Snack bar when back is blocked while saving notes.
  ///
  /// In en, this message translates to:
  /// **'Please wait while assessment notes are being saved.'**
  String get specialistCaseAssessmentWaitSavingNotes;

  /// Snack bar when back is blocked while creating profile.
  ///
  /// In en, this message translates to:
  /// **'Please wait while the patient profile is being created.'**
  String get specialistCaseAssessmentWaitCreatingProfile;

  /// Snack bar when back is blocked while rejecting.
  ///
  /// In en, this message translates to:
  /// **'Please wait while the case is being rejected.'**
  String get specialistCaseAssessmentWaitRejecting;

  /// Snack bar when back is blocked while starting assessment.
  ///
  /// In en, this message translates to:
  /// **'Please wait while the assessment is starting.'**
  String get specialistCaseAssessmentWaitStarting;

  /// Error when start assessment is not allowed.
  ///
  /// In en, this message translates to:
  /// **'Only assigned case requests can start assessment'**
  String get specialistCaseAssessmentOnlyAssignedCanStart;

  /// Error when accept is not allowed.
  ///
  /// In en, this message translates to:
  /// **'Only case requests under assessment can be accepted'**
  String get specialistCaseAssessmentOnlyUnderAssessmentCanAccept;

  /// Error when reject is not allowed for status.
  ///
  /// In en, this message translates to:
  /// **'Only assigned or under-assessment requests can be rejected'**
  String get specialistCaseAssessmentOnlyAssignedOrUnderAssessmentCanReject;

  /// Error when reject is no longer allowed.
  ///
  /// In en, this message translates to:
  /// **'This case request can no longer be rejected'**
  String get specialistCaseAssessmentCannotRejectAnymore;

  /// Error when starting assessment fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to start assessment. Please try again.'**
  String get specialistCaseAssessmentStartFailed;

  /// Error when saving assessment notes fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to update assessment notes. Please try again.'**
  String get specialistCaseAssessmentSaveNotesFailed;

  /// Error when accepting case fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to accept case request. Please try again.'**
  String get specialistCaseAssessmentAcceptFailed;

  /// Error when rejecting case fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to reject case request. Please try again.'**
  String get specialistCaseAssessmentRejectFailed;

  /// Error when admin matching specialists list fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load matching specialists: {error}'**
  String adminCaseAssignmentLoadFailed(String error);

  /// Error when assign is tapped while already assigning.
  ///
  /// In en, this message translates to:
  /// **'Assignment already in progress.'**
  String get adminCaseAssignmentInProgress;

  /// Error when no specialist is selected for assignment.
  ///
  /// In en, this message translates to:
  /// **'Select a specialist to continue.'**
  String get adminCaseAssignmentSelectSpecialist;

  /// Generic error when specialist assignment fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to assign specialist. Please try again.'**
  String get adminCaseAssignmentFailed;

  /// Error when assigning a non-pending case request.
  ///
  /// In en, this message translates to:
  /// **'Only pending case requests can be assigned'**
  String get adminCaseAssignmentOnlyPending;

  /// Helper text after selecting a specialist for assignment.
  ///
  /// In en, this message translates to:
  /// **'The selected specialist will be notified after assignment.'**
  String get adminCaseAssignmentNotifySpecialist;

  /// Empty state when no specialists match the case category.
  ///
  /// In en, this message translates to:
  /// **'There are currently no active specialists linked to this category.'**
  String get adminCaseAssignmentNoActiveSpecialists;

  /// Header subtitle showing who submitted the case request.
  ///
  /// In en, this message translates to:
  /// **'Submitted by {name}'**
  String adminCaseRequestDetailsSubmittedBy(String name);

  /// Short case request identifier label.
  ///
  /// In en, this message translates to:
  /// **'ID: {id}'**
  String adminCaseRequestDetailsRequestId(String id);

  /// Card title when case request was rejected.
  ///
  /// In en, this message translates to:
  /// **'Request rejected'**
  String get adminCaseRequestDetailsRejectedTitle;

  /// Short patient identifier after conversion.
  ///
  /// In en, this message translates to:
  /// **'Patient ID: {id}'**
  String adminCaseRequestDetailsPatientId(String id);

  /// Admin-only assessment notes section title.
  ///
  /// In en, this message translates to:
  /// **'Internal Preliminary Assessment Notes'**
  String get adminCaseRequestDetailsAssessmentNotesTitle;

  /// Hint that assessment notes are admin-only.
  ///
  /// In en, this message translates to:
  /// **'Visible to admin only'**
  String get adminCaseRequestDetailsAssessmentNotesHint;

  /// Indicator when a conversation was created for the case.
  ///
  /// In en, this message translates to:
  /// **'Conversation created'**
  String get adminCaseRequestDetailsConversationCreated;

  /// Short conversation identifier.
  ///
  /// In en, this message translates to:
  /// **'Conversation ID: {id}'**
  String adminCaseRequestDetailsConversationId(String id);

  /// Empty specialist state for pending requests.
  ///
  /// In en, this message translates to:
  /// **'No specialist assigned yet.'**
  String get adminCaseRequestDetailsNoSpecialistPending;

  /// Empty specialist state for non-pending requests.
  ///
  /// In en, this message translates to:
  /// **'No specialist assigned.'**
  String get adminCaseRequestDetailsNoSpecialist;

  /// Fallback when specialist years of experience is unknown.
  ///
  /// In en, this message translates to:
  /// **'— Years'**
  String get adminMatchingSpecialistsYearsUnknown;

  /// Specialist experience chip for one year.
  ///
  /// In en, this message translates to:
  /// **'1 Year'**
  String get adminMatchingSpecialistsOneYear;

  /// Specialist experience chip for multiple years.
  ///
  /// In en, this message translates to:
  /// **'{count} Years'**
  String adminMatchingSpecialistsYears(int count);

  /// Metric chip for one active patient.
  ///
  /// In en, this message translates to:
  /// **'1 Active Patient'**
  String get adminMatchingSpecialistsOneActivePatient;

  /// Metric chip for multiple active patients.
  ///
  /// In en, this message translates to:
  /// **'{count} Active Patients'**
  String adminMatchingSpecialistsActivePatients(int count);

  /// Metric chip for one current case request.
  ///
  /// In en, this message translates to:
  /// **'1 Current Request'**
  String get adminMatchingSpecialistsOneCurrentRequest;

  /// Metric chip for multiple current case requests.
  ///
  /// In en, this message translates to:
  /// **'{count} Current Requests'**
  String adminMatchingSpecialistsCurrentRequests(int count);

  /// Specialist license number label.
  ///
  /// In en, this message translates to:
  /// **'License: {number}'**
  String adminMatchingSpecialistsLicense(String number);

  /// Parent sessions tab for upcoming sessions.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get parentSessionsTabUpcoming;

  /// Parent sessions tab for past sessions.
  ///
  /// In en, this message translates to:
  /// **'Past'**
  String get parentSessionsTabPast;

  /// Summary card heading when upcoming sessions exist.
  ///
  /// In en, this message translates to:
  /// **'Stay on track!'**
  String get parentSessionsSummaryStayOnTrack;

  /// Summary card heading when no upcoming sessions exist.
  ///
  /// In en, this message translates to:
  /// **'No upcoming sessions'**
  String get parentSessionsSummaryNoUpcoming;

  /// Summary card message for one upcoming session.
  ///
  /// In en, this message translates to:
  /// **'You have 1 upcoming session.'**
  String get parentSessionsSummaryOneUpcoming;

  /// Summary card message for multiple upcoming sessions.
  ///
  /// In en, this message translates to:
  /// **'You have {count} upcoming sessions.'**
  String parentSessionsSummaryUpcomingCount(int count);

  /// Summary card message when no upcoming sessions exist.
  ///
  /// In en, this message translates to:
  /// **'Past sessions are still available below.'**
  String get parentSessionsSummaryPastAvailable;

  /// Section heading for upcoming sessions.
  ///
  /// In en, this message translates to:
  /// **'Upcoming Session'**
  String get parentSessionsSectionUpcoming;

  /// Section heading for past sessions.
  ///
  /// In en, this message translates to:
  /// **'Past Sessions'**
  String get parentSessionsSectionPast;

  /// Empty state title for upcoming sessions.
  ///
  /// In en, this message translates to:
  /// **'No upcoming sessions'**
  String get parentSessionsEmptyUpcomingTitle;

  /// Empty state message for upcoming sessions.
  ///
  /// In en, this message translates to:
  /// **'You do not have any scheduled sessions right now.'**
  String get parentSessionsEmptyUpcomingMessage;

  /// Empty state title for past sessions.
  ///
  /// In en, this message translates to:
  /// **'No past sessions yet'**
  String get parentSessionsEmptyPastTitle;

  /// Empty state message for past sessions.
  ///
  /// In en, this message translates to:
  /// **'Completed sessions will appear here.'**
  String get parentSessionsEmptyPastMessage;

  /// Call-to-action card title for requesting a session.
  ///
  /// In en, this message translates to:
  /// **'Need to schedule a session?'**
  String get parentSessionsRequestCardTitle;

  /// Call-to-action card message for requesting a session.
  ///
  /// In en, this message translates to:
  /// **'Request a new session with your specialist at a time that suits you.'**
  String get parentSessionsRequestCardMessage;

  /// Button to open the request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Request New Session'**
  String get parentSessionsRequestNewSession;

  /// Bottom sheet title for session details.
  ///
  /// In en, this message translates to:
  /// **'Session Details'**
  String get parentSessionsDetailsTitle;

  /// Label for online session location row.
  ///
  /// In en, this message translates to:
  /// **'Online session'**
  String get parentSessionsOnlineSession;

  /// Button to copy an online session link.
  ///
  /// In en, this message translates to:
  /// **'Copy Meeting Link'**
  String get parentSessionsCopyMeetingLink;

  /// Button to open an online session link.
  ///
  /// In en, this message translates to:
  /// **'Open Meeting Link'**
  String get parentSessionsOpenMeetingLink;

  /// Snack bar after copying a session link.
  ///
  /// In en, this message translates to:
  /// **'Session link copied'**
  String get parentSessionsLinkCopied;

  /// Snack bar when no session link exists to copy.
  ///
  /// In en, this message translates to:
  /// **'No session link available'**
  String get parentSessionsNoLinkAvailable;

  /// Snack bar when a session link cannot be opened.
  ///
  /// In en, this message translates to:
  /// **'No valid session link available'**
  String get parentSessionsNoValidLink;

  /// Fallback when session location is not set.
  ///
  /// In en, this message translates to:
  /// **'Location pending'**
  String get parentSessionsLocationPending;

  /// Online session label for Google Meet links.
  ///
  /// In en, this message translates to:
  /// **'Online • Google Meet'**
  String get parentSessionsOnlineGoogleMeet;

  /// Generic online video session label.
  ///
  /// In en, this message translates to:
  /// **'Online • Video Session'**
  String get parentSessionsOnlineVideoSession;

  /// Error when parent sessions require authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view sessions.'**
  String get parentSessionsSignInRequired;

  /// Error when parent sessions fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load sessions: {error}'**
  String parentSessionsLoadFailed(String error);

  /// Section heading for submitted session requests.
  ///
  /// In en, this message translates to:
  /// **'My Session Requests'**
  String get parentSessionsMyRequests;

  /// Empty state title for session requests.
  ///
  /// In en, this message translates to:
  /// **'No session requests yet.'**
  String get parentSessionsNoRequestsTitle;

  /// Empty state message for session requests.
  ///
  /// In en, this message translates to:
  /// **'Use Request New Session above when you need an appointment.'**
  String get parentSessionsNoRequestsMessage;

  /// Label showing when a session request was submitted.
  ///
  /// In en, this message translates to:
  /// **'Requested {date}'**
  String parentSessionsRequestedOn(String date);

  /// Approved session schedule summary on a request card.
  ///
  /// In en, this message translates to:
  /// **'Scheduled: {date} at {time}'**
  String parentSessionsScheduledAt(String date, String time);

  /// Title for the request session bottom sheet.
  ///
  /// In en, this message translates to:
  /// **'Request New Session'**
  String get parentSessionRequestTitle;

  /// Intro text on the request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Submit a session request for your specialist to review.'**
  String get parentSessionRequestIntro;

  /// Error when linked children fail to load for session request.
  ///
  /// In en, this message translates to:
  /// **'Failed to load children: {error}'**
  String parentSessionRequestLoadChildrenFailed(String error);

  /// Empty state when no children are linked to the parent account.
  ///
  /// In en, this message translates to:
  /// **'No linked children found. Please contact your clinic administrator.'**
  String get parentSessionRequestNoChildren;

  /// Child dropdown label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get parentSessionRequestChild;

  /// Specialist dropdown label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get parentSessionRequestSpecialist;

  /// Reason dropdown label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Reason'**
  String get parentSessionRequestReason;

  /// Text field label for custom session request reason.
  ///
  /// In en, this message translates to:
  /// **'Other Reason'**
  String get parentSessionRequestOtherReason;

  /// Preferred date field label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Preferred Date'**
  String get parentSessionRequestPreferredDate;

  /// Placeholder when no preferred date is selected.
  ///
  /// In en, this message translates to:
  /// **'Select date'**
  String get parentSessionRequestSelectDate;

  /// Preferred time dropdown label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Preferred Time'**
  String get parentSessionRequestPreferredTime;

  /// Optional notes field label on request session sheet.
  ///
  /// In en, this message translates to:
  /// **'Notes (optional)'**
  String get parentSessionRequestNotesOptional;

  /// Submit button label while request is submitting.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get parentSessionRequestSending;

  /// Submit button label for session request.
  ///
  /// In en, this message translates to:
  /// **'Send Request'**
  String get parentSessionRequestSendRequest;

  /// Dropdown hint for selecting a request session field value.
  ///
  /// In en, this message translates to:
  /// **'Select {label}'**
  String parentSessionRequestSelectHint(String label);

  /// Inline warning when selected child has no specialist.
  ///
  /// In en, this message translates to:
  /// **'No specialist is assigned to this child yet.'**
  String get parentSessionRequestNoSpecialistAssigned;

  /// Validation error when submitting without an assigned specialist.
  ///
  /// In en, this message translates to:
  /// **'No specialist is assigned to this child.'**
  String get parentSessionRequestNoSpecialistForSubmit;

  /// Snack bar after successful session request submission.
  ///
  /// In en, this message translates to:
  /// **'Session request submitted successfully.'**
  String get parentSessionRequestSubmittedSuccess;

  /// Error when session requests require authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view session requests.'**
  String get parentSessionRequestSignInRequired;

  /// Error when session requests fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load session requests: {error}'**
  String parentSessionRequestLoadFailed(String error);

  /// Error when session request submission fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit session request: {error}'**
  String parentSessionRequestSubmitFailed(String error);

  /// Error when a session request is already submitting.
  ///
  /// In en, this message translates to:
  /// **'A submission is already in progress.'**
  String get parentSessionRequestSubmitInProgress;

  /// Validation error when child is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a child.'**
  String get parentSessionRequestSelectChild;

  /// Validation error when reason is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a reason.'**
  String get parentSessionRequestSelectReason;

  /// Validation error when other reason is empty.
  ///
  /// In en, this message translates to:
  /// **'Please enter the other reason.'**
  String get parentSessionRequestEnterOtherReason;

  /// Validation error when preferred date is missing.
  ///
  /// In en, this message translates to:
  /// **'Please select a preferred date.'**
  String get parentSessionRequestSelectPreferredDate;

  /// Validation error when preferred time is missing.
  ///
  /// In en, this message translates to:
  /// **'Please select a preferred time.'**
  String get parentSessionRequestSelectPreferredTime;

  /// Title for parent child detail screen.
  ///
  /// In en, this message translates to:
  /// **'Child Details'**
  String get parentExerciseChildDetailsTitle;

  /// Empty state when child detail is missing.
  ///
  /// In en, this message translates to:
  /// **'Child not found.'**
  String get parentExerciseChildNotFound;

  /// Error when child details fail to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load child details: {error}'**
  String parentExerciseChildDetailsLoadFailed(String error);

  /// Child age label on detail screen.
  ///
  /// In en, this message translates to:
  /// **'Age: {age}'**
  String parentExerciseAgeLabel(int age);

  /// Child date of birth label.
  ///
  /// In en, this message translates to:
  /// **'Date of birth: {date}'**
  String parentExerciseDateOfBirthLabel(String date);

  /// Child gender label.
  ///
  /// In en, this message translates to:
  /// **'Gender: {gender}'**
  String parentExerciseGenderLabel(String gender);

  /// Child progress percentage label.
  ///
  /// In en, this message translates to:
  /// **'Progress: {percent}%'**
  String parentExerciseProgressLabel(int percent);

  /// Section title for assigned exercises on child detail.
  ///
  /// In en, this message translates to:
  /// **'Assigned Exercises'**
  String get parentExerciseAssignedExercisesTitle;

  /// Empty state for assigned exercises on child detail.
  ///
  /// In en, this message translates to:
  /// **'No assigned exercises yet.'**
  String get parentExerciseNoAssignedYet;

  /// Empty state for reports on child detail.
  ///
  /// In en, this message translates to:
  /// **'No reports yet.'**
  String get parentExerciseNoReportsYet;

  /// Empty state for sessions on child detail.
  ///
  /// In en, this message translates to:
  /// **'No sessions scheduled.'**
  String get parentExerciseNoSessionsScheduled;

  /// Session row on child detail screen.
  ///
  /// In en, this message translates to:
  /// **'{specialist} • {date} • {status}'**
  String parentExerciseSessionSummary(
    String specialist,
    String date,
    String status,
  );

  /// Exercise detail subtitle showing selected child.
  ///
  /// In en, this message translates to:
  /// **'For {childName}'**
  String parentExerciseForChild(String childName);

  /// Section title on exercise detail screen.
  ///
  /// In en, this message translates to:
  /// **'Exercise information'**
  String get parentExerciseInformation;

  /// Instructions section label.
  ///
  /// In en, this message translates to:
  /// **'Instructions'**
  String get parentExerciseInstructions;

  /// Fallback when exercise has no instructions.
  ///
  /// In en, this message translates to:
  /// **'Follow the specialist instructions for this exercise.'**
  String get parentExerciseInstructionsFallback;

  /// Exercise frequency label.
  ///
  /// In en, this message translates to:
  /// **'Frequency: {frequency}'**
  String parentExerciseFrequencyLabel(String frequency);

  /// Label when exercise was already submitted.
  ///
  /// In en, this message translates to:
  /// **'Already submitted'**
  String get parentExerciseAlreadySubmitted;

  /// Status when submission is pending review.
  ///
  /// In en, this message translates to:
  /// **'Awaiting specialist review'**
  String get parentExerciseAwaitingReview;

  /// Status when latest submission is reviewed.
  ///
  /// In en, this message translates to:
  /// **'This exercise has been reviewed.'**
  String get parentExerciseReviewedStatus;

  /// Message when specialist requested a retry.
  ///
  /// In en, this message translates to:
  /// **'Your specialist requested another attempt.'**
  String get parentExerciseRetryRequested;

  /// Button label to submit a retry attempt.
  ///
  /// In en, this message translates to:
  /// **'Retry Exercise'**
  String get parentExerciseRetry;

  /// Submission section title on exercise detail.
  ///
  /// In en, this message translates to:
  /// **'Your Submission'**
  String get parentExerciseYourSubmission;

  /// Notes field label on exercise submission.
  ///
  /// In en, this message translates to:
  /// **'Notes for specialist (optional)'**
  String get parentExerciseNotesForSpecialist;

  /// Submit button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get parentExerciseSubmitting;

  /// Submit exercise button label.
  ///
  /// In en, this message translates to:
  /// **'Submit Exercise'**
  String get parentExerciseSubmit;

  /// Snack bar after successful exercise submission.
  ///
  /// In en, this message translates to:
  /// **'Exercise submitted successfully'**
  String get parentExerciseSubmitSuccess;

  /// Generic exercise submission failure.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit exercise. Please try again.'**
  String get parentExerciseSubmitFailed;

  /// Upload permission error.
  ///
  /// In en, this message translates to:
  /// **'You do not have permission to upload this file.'**
  String get parentExerciseUploadPermissionDenied;

  /// Unsupported media type error.
  ///
  /// In en, this message translates to:
  /// **'This file type is not supported.'**
  String get parentExerciseUploadUnsupportedType;

  /// File size upload error.
  ///
  /// In en, this message translates to:
  /// **'The selected file is too large.'**
  String get parentExerciseUploadFileTooLarge;

  /// Media upload failure.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload media. Please try again.'**
  String get parentExerciseUploadFailed;

  /// Sign-in required for upload.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to upload this file.'**
  String get parentExerciseUploadSignInRequired;

  /// Title for instructional media card on parent exercise detail.
  ///
  /// In en, this message translates to:
  /// **'Instructional Media'**
  String get parentExerciseInstructionMedia;

  /// Parent feedback screen title.
  ///
  /// In en, this message translates to:
  /// **'Specialist Feedback'**
  String get parentFeedbackTitle;

  /// Empty state on parent feedback screen.
  ///
  /// In en, this message translates to:
  /// **'No specialist feedback available yet.'**
  String get parentFeedbackNoneYet;

  /// Shows which child feedback belongs to.
  ///
  /// In en, this message translates to:
  /// **'For {name}'**
  String parentFeedbackForChild(String name);

  /// Review date label on feedback detail.
  ///
  /// In en, this message translates to:
  /// **'Review date: {date}'**
  String parentFeedbackReviewDate(String date);

  /// Heading for specialist review comments.
  ///
  /// In en, this message translates to:
  /// **'Specialist comments'**
  String get parentFeedbackSpecialistComments;

  /// Error when feedback requires authentication.
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view feedback.'**
  String get parentFeedbackSignInRequired;

  /// Generic feedback load failure message.
  ///
  /// In en, this message translates to:
  /// **'Failed to load feedback. Please try again.'**
  String get parentFeedbackLoadFailed;

  /// Specialist feedback rating label.
  ///
  /// In en, this message translates to:
  /// **'Rating: {rating}/5'**
  String parentFeedbackRating(int rating);

  /// Active treatment plan status.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get parentFeedbackPlanStatusActive;

  /// Archived treatment plan status.
  ///
  /// In en, this message translates to:
  /// **'Archived'**
  String get parentFeedbackPlanStatusArchived;

  /// Treatment plan specialist label.
  ///
  /// In en, this message translates to:
  /// **'Specialist: {name}'**
  String parentFeedbackSpecialistLabel(String name);

  /// Treatment plan start date label.
  ///
  /// In en, this message translates to:
  /// **'Start: {date}'**
  String parentFeedbackPlanStart(String date);

  /// Treatment plan end date label.
  ///
  /// In en, this message translates to:
  /// **'End: {date}'**
  String parentFeedbackPlanEnd(String date);

  /// Heading when treatment plan is completed.
  ///
  /// In en, this message translates to:
  /// **'Treatment Completed'**
  String get parentFeedbackTreatmentCompleted;

  /// Message when treatment plan is completed.
  ///
  /// In en, this message translates to:
  /// **'Your child\'s rehabilitation plan has been completed.'**
  String get parentFeedbackPlanCompletedMessage;

  /// Prompt to rate specialist after treatment.
  ///
  /// In en, this message translates to:
  /// **'We\'d love to hear about your experience with your specialist.'**
  String get parentFeedbackExperiencePrompt;

  /// Optional comment field label.
  ///
  /// In en, this message translates to:
  /// **'Comment (optional)'**
  String get parentFeedbackCommentOptional;

  /// Hint for specialist feedback comment field.
  ///
  /// In en, this message translates to:
  /// **'Share your experience with the specialist...'**
  String get parentFeedbackCommentHint;

  /// Submit specialist feedback button.
  ///
  /// In en, this message translates to:
  /// **'Submit Feedback'**
  String get parentFeedbackSubmit;

  /// Thank you heading after feedback submission.
  ///
  /// In en, this message translates to:
  /// **'Thank You!'**
  String get parentFeedbackThankYou;

  /// Thank you message after feedback submission.
  ///
  /// In en, this message translates to:
  /// **'Thank you for sharing your feedback.'**
  String get parentFeedbackThankYouMessage;

  /// Label before specialist name in thank you card.
  ///
  /// In en, this message translates to:
  /// **'You rated'**
  String get parentFeedbackYouRated;

  /// Fallback specialist name in thank you card.
  ///
  /// In en, this message translates to:
  /// **'your specialist'**
  String get parentFeedbackYourSpecialist;

  /// Rating display out of five.
  ///
  /// In en, this message translates to:
  /// **'{rating} / 5'**
  String parentFeedbackRatingOutOfFive(int rating);

  /// Footer message on thank you card.
  ///
  /// In en, this message translates to:
  /// **'Your opinion helps us improve our rehabilitation services\nand support more families.'**
  String get parentFeedbackImproveServices;

  /// Success banner on thank you card.
  ///
  /// In en, this message translates to:
  /// **'Your feedback has been recorded successfully.'**
  String get parentFeedbackRecordedSuccess;

  /// Add media button and sheet title.
  ///
  /// In en, this message translates to:
  /// **'Add media'**
  String get parentMediaAdd;

  /// Description on add media sheet.
  ///
  /// In en, this message translates to:
  /// **'Optional photo, video, or audio for the specialist.'**
  String get parentMediaAddDescription;

  /// Pick media from gallery or files.
  ///
  /// In en, this message translates to:
  /// **'Choose from gallery / files'**
  String get parentMediaChooseFromGallery;

  /// Record video option.
  ///
  /// In en, this message translates to:
  /// **'Record video'**
  String get parentMediaRecordVideo;

  /// Record audio option and sheet title.
  ///
  /// In en, this message translates to:
  /// **'Record audio'**
  String get parentMediaRecordAudio;

  /// Capture photo option.
  ///
  /// In en, this message translates to:
  /// **'Take photo'**
  String get parentMediaTakePhoto;

  /// Photo media type label.
  ///
  /// In en, this message translates to:
  /// **'Photo'**
  String get parentMediaPhoto;

  /// Snack bar when media permission denied.
  ///
  /// In en, this message translates to:
  /// **'Permission is required to add media.'**
  String get parentMediaPermissionRequired;

  /// Audio recorder status while recording.
  ///
  /// In en, this message translates to:
  /// **'Recording in progress...'**
  String get parentMediaRecordingInProgress;

  /// Audio recorder instructions.
  ///
  /// In en, this message translates to:
  /// **'Tap start, then stop when finished.'**
  String get parentMediaTapStartStop;

  /// Audio recorder active state label.
  ///
  /// In en, this message translates to:
  /// **'Recording audio'**
  String get parentMediaRecordingAudio;

  /// Audio recorder idle state label.
  ///
  /// In en, this message translates to:
  /// **'Ready to record'**
  String get parentMediaReadyToRecord;

  /// Start audio recording button.
  ///
  /// In en, this message translates to:
  /// **'Start Recording'**
  String get parentMediaStartRecording;

  /// Stop audio recording button.
  ///
  /// In en, this message translates to:
  /// **'Stop Recording'**
  String get parentMediaStopRecording;

  /// Audio recording failure message.
  ///
  /// In en, this message translates to:
  /// **'Could not record audio. Please try again.'**
  String get parentMediaRecordFailed;

  /// Selected media attachment summary.
  ///
  /// In en, this message translates to:
  /// **'{type} attached'**
  String parentMediaAttached(String type);

  /// Tooltip for remove media button.
  ///
  /// In en, this message translates to:
  /// **'Remove media'**
  String get parentMediaRemoveTooltip;

  /// Fallback when audit log timestamp is missing.
  ///
  /// In en, this message translates to:
  /// **'Unknown date'**
  String get adminAuditUnknownDate;

  /// Label for audit log entity reference UUID.
  ///
  /// In en, this message translates to:
  /// **'Reference ID'**
  String get adminAuditReferenceId;

  /// Display name when audit log has no user.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get adminAuditSystemUser;

  /// Entity label when audit log has no entity name.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get adminAuditSystemEntity;

  /// Avatar initials fallback for system user.
  ///
  /// In en, this message translates to:
  /// **'SY'**
  String get adminAuditSystemUserInitials;

  /// Generic audit action label.
  ///
  /// In en, this message translates to:
  /// **'Activity'**
  String get auditActionActivity;

  /// Audit action badge for create operations.
  ///
  /// In en, this message translates to:
  /// **'Create'**
  String get auditActionCreate;

  /// Audit action badge for update operations.
  ///
  /// In en, this message translates to:
  /// **'Update'**
  String get auditActionUpdate;

  /// Audit action badge for complete operations.
  ///
  /// In en, this message translates to:
  /// **'Complete'**
  String get auditActionComplete;

  /// Audit action badge for delete operations.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get auditActionDelete;

  /// Audit action badge for assign operations.
  ///
  /// In en, this message translates to:
  /// **'Assign'**
  String get auditActionAssign;

  /// Audit action for login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get auditActionLogin;

  /// Audit action for logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get auditActionLogout;

  /// Audit action badge for cancel operations.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get auditActionCancel;

  /// Audit action for activate.
  ///
  /// In en, this message translates to:
  /// **'Activate'**
  String get auditActionActivate;

  /// Audit action for deactivate.
  ///
  /// In en, this message translates to:
  /// **'Deactivate'**
  String get auditActionDeactivate;

  /// Audit action for unassign.
  ///
  /// In en, this message translates to:
  /// **'Unassign'**
  String get auditActionUnassign;

  /// Audit action for approve.
  ///
  /// In en, this message translates to:
  /// **'Approve'**
  String get auditActionApprove;

  /// Audit action for reject.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get auditActionReject;

  /// Audit action for accept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get auditActionAccept;

  /// Audit action for archive.
  ///
  /// In en, this message translates to:
  /// **'Archive'**
  String get auditActionArchive;

  /// Audit action for upload.
  ///
  /// In en, this message translates to:
  /// **'Upload'**
  String get auditActionUpload;

  /// Audit action for generate.
  ///
  /// In en, this message translates to:
  /// **'Generate'**
  String get auditActionGenerate;

  /// Audit action for review.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get auditActionReview;

  /// Audit action for mark_read.
  ///
  /// In en, this message translates to:
  /// **'Mark read'**
  String get auditActionMarkRead;

  /// Audit action for read_all.
  ///
  /// In en, this message translates to:
  /// **'Read all'**
  String get auditActionReadAll;

  /// Audit title for session_complete.
  ///
  /// In en, this message translates to:
  /// **'Session Completed'**
  String get auditActionSessionComplete;

  /// Audit title for session_cancel.
  ///
  /// In en, this message translates to:
  /// **'Session Cancelled'**
  String get auditActionSessionCancel;

  /// Audit title for session_create.
  ///
  /// In en, this message translates to:
  /// **'Session Created'**
  String get auditActionSessionCreate;

  /// Audit title for session_update.
  ///
  /// In en, this message translates to:
  /// **'Session Updated'**
  String get auditActionSessionUpdate;

  /// Audit title for session_delete.
  ///
  /// In en, this message translates to:
  /// **'Session Deleted'**
  String get auditActionSessionDelete;

  /// Audit title for session_no_show.
  ///
  /// In en, this message translates to:
  /// **'Session Marked No Show'**
  String get auditActionSessionNoShow;

  /// Audit title for patient_create.
  ///
  /// In en, this message translates to:
  /// **'Patient Created'**
  String get auditActionPatientCreate;

  /// Audit title for patient_update.
  ///
  /// In en, this message translates to:
  /// **'Patient Updated'**
  String get auditActionPatientUpdate;

  /// Audit title for patient_delete.
  ///
  /// In en, this message translates to:
  /// **'Patient Deleted'**
  String get auditActionPatientDelete;

  /// Audit title for treatment plan create.
  ///
  /// In en, this message translates to:
  /// **'Treatment Plan Created'**
  String get auditActionTreatmentPlanCreate;

  /// Audit title for goal add/create.
  ///
  /// In en, this message translates to:
  /// **'Goal Added'**
  String get auditActionGoalAdd;

  /// Audit title for exercise assign.
  ///
  /// In en, this message translates to:
  /// **'Exercise Assigned'**
  String get auditActionExerciseAssign;

  /// Audit title for parent link.
  ///
  /// In en, this message translates to:
  /// **'Parent Linked'**
  String get auditActionParentLink;

  /// Audit title for specialist assign.
  ///
  /// In en, this message translates to:
  /// **'Specialist Assigned'**
  String get auditActionSpecialistAssign;

  /// Audit title for user_create.
  ///
  /// In en, this message translates to:
  /// **'User Created'**
  String get auditActionUserCreate;

  /// Audit title for user_update.
  ///
  /// In en, this message translates to:
  /// **'User Updated'**
  String get auditActionUserUpdate;

  /// Audit title for user_delete.
  ///
  /// In en, this message translates to:
  /// **'User Deleted'**
  String get auditActionUserDelete;

  /// Audit title for case_category_create.
  ///
  /// In en, this message translates to:
  /// **'Case Category Created'**
  String get auditActionCaseCategoryCreate;

  /// Audit title for case_category_update.
  ///
  /// In en, this message translates to:
  /// **'Case Category Updated'**
  String get auditActionCaseCategoryUpdate;

  /// Audit title for specialist_case_categories_update.
  ///
  /// In en, this message translates to:
  /// **'Specialist Categories Updated'**
  String get auditActionSpecialistCaseCategoriesUpdate;

  /// Audit title for case_intake_request_create.
  ///
  /// In en, this message translates to:
  /// **'Case Request Created'**
  String get auditActionCaseIntakeRequestCreate;

  /// Audit title for case_intake_request_update.
  ///
  /// In en, this message translates to:
  /// **'Case Request Updated'**
  String get auditActionCaseIntakeRequestUpdate;

  /// Audit title for case_intake_attachment_add.
  ///
  /// In en, this message translates to:
  /// **'Attachment Added'**
  String get auditActionCaseIntakeAttachmentAdd;

  /// Audit title for case_intake_attachment_delete.
  ///
  /// In en, this message translates to:
  /// **'Attachment Deleted'**
  String get auditActionCaseIntakeAttachmentDelete;

  /// Audit title for case_intake_request_assign.
  ///
  /// In en, this message translates to:
  /// **'Case Request Assigned'**
  String get auditActionCaseIntakeRequestAssign;

  /// Audit title for case_intake_assessment_start.
  ///
  /// In en, this message translates to:
  /// **'Assessment Started'**
  String get auditActionCaseIntakeAssessmentStart;

  /// Audit title for case_intake_assessment_notes_update.
  ///
  /// In en, this message translates to:
  /// **'Assessment Notes Updated'**
  String get auditActionCaseIntakeAssessmentNotesUpdate;

  /// Audit title for case_intake_request_accept.
  ///
  /// In en, this message translates to:
  /// **'Case Request Accepted'**
  String get auditActionCaseIntakeRequestAccept;

  /// Audit title for case_intake_request_reject.
  ///
  /// In en, this message translates to:
  /// **'Case Request Rejected'**
  String get auditActionCaseIntakeRequestReject;

  /// Audit title for case_intake_request_convert.
  ///
  /// In en, this message translates to:
  /// **'Case Converted to Patient'**
  String get auditActionCaseIntakeRequestConvert;

  /// Audit entity type case_category.
  ///
  /// In en, this message translates to:
  /// **'Case Category'**
  String get auditEntityCaseCategory;

  /// Audit entity type assigned_exercise.
  ///
  /// In en, this message translates to:
  /// **'Assigned Exercise'**
  String get auditEntityAssignedExercise;

  /// Audit entity type submission.
  ///
  /// In en, this message translates to:
  /// **'Submission'**
  String get auditEntitySubmission;

  /// Audit entity type review.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get auditEntityReview;

  /// Audit entity type speech_analysis.
  ///
  /// In en, this message translates to:
  /// **'Speech Analysis'**
  String get auditEntitySpeechAnalysis;

  /// Audit entity type ai_recommendation.
  ///
  /// In en, this message translates to:
  /// **'AI Recommendation'**
  String get auditEntityAiRecommendation;

  /// Audit entity type ai_report.
  ///
  /// In en, this message translates to:
  /// **'AI Report'**
  String get auditEntityAiReport;

  /// Full password requirements message.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'**
  String get authPasswordRequirementsDescription;

  /// Prompt before sign in link on signup.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? '**
  String get authAlreadyHaveAccount;

  /// Generic required fields validation.
  ///
  /// In en, this message translates to:
  /// **'Please complete all required fields'**
  String get authCompleteRequiredFields;

  /// Password confirmation mismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match.'**
  String get authPasswordsDoNotMatch;

  /// Registration provider error.
  ///
  /// In en, this message translates to:
  /// **'Unable to create your account right now. Please try again.'**
  String get authRegisterUnableToCreate;

  /// Profile photo upload failure.
  ///
  /// In en, this message translates to:
  /// **'Unable to upload your profile photo right now.'**
  String get authUploadProfileFailed;

  /// Profile photo upload retry message.
  ///
  /// In en, this message translates to:
  /// **'Unable to upload your profile photo. Please try again.'**
  String get authUploadProfileRetry;

  /// Forgot password provider error.
  ///
  /// In en, this message translates to:
  /// **'Unable to send the reset link right now. Please try again.'**
  String get authSendResetLinkUnable;

  /// Reset password provider error.
  ///
  /// In en, this message translates to:
  /// **'Unable to reset your password right now. Please try again.'**
  String get authResetPasswordUnable;

  /// Verify email provider error.
  ///
  /// In en, this message translates to:
  /// **'Unable to verify your email right now. Please try again later.'**
  String get authVerifyEmailUnable;

  /// Resend verification provider error.
  ///
  /// In en, this message translates to:
  /// **'Unable to send the verification email right now. Please try again.'**
  String get authVerifyEmailResendUnable;

  /// Generic registration failure.
  ///
  /// In en, this message translates to:
  /// **'Registration failed. Please try again.'**
  String get authRegistrationFailed;

  /// Signup wizard first step title.
  ///
  /// In en, this message translates to:
  /// **'Create Your Account'**
  String get signupCreateYourAccount;

  /// Signup role step subtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose how you\'ll use Smart Rehabilitation.'**
  String get signupStepSubtitleRole;

  /// Signup personal info subtitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us a little about yourself.'**
  String get signupStepSubtitlePersonal;

  /// Signup professional info subtitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us about your professional background.'**
  String get signupStepSubtitleProfessional;

  /// Signup security step subtitle.
  ///
  /// In en, this message translates to:
  /// **'Secure your account with a strong password.'**
  String get signupStepSubtitleSecurity;

  /// Signup review step subtitle.
  ///
  /// In en, this message translates to:
  /// **'Review your details before creating your account.'**
  String get signupStepSubtitleReview;

  /// Personal step validation snackbar.
  ///
  /// In en, this message translates to:
  /// **'Please complete all required personal fields'**
  String get signupCompletePersonalFields;

  /// Professional step validation snackbar.
  ///
  /// In en, this message translates to:
  /// **'Please complete all required professional fields'**
  String get signupCompleteProfessionalFields;

  /// Terms acceptance required.
  ///
  /// In en, this message translates to:
  /// **'You must accept the Terms of Service and Privacy Policy.'**
  String get signupTermsRequired;

  /// Role selection required.
  ///
  /// In en, this message translates to:
  /// **'Please select your role'**
  String get signupSelectRoleRequired;

  /// Photo selection failure.
  ///
  /// In en, this message translates to:
  /// **'Unable to select your profile photo right now.'**
  String get signupPhotoSelectFailed;

  /// Camera permission denied.
  ///
  /// In en, this message translates to:
  /// **'Camera access is required to take a photo. Enable camera permission in your device settings if it was denied.'**
  String get signupCameraPermissionDenied;

  /// Camera unavailable.
  ///
  /// In en, this message translates to:
  /// **'Camera is unavailable on this device right now.'**
  String get signupCameraUnavailable;

  /// Camera open failure.
  ///
  /// In en, this message translates to:
  /// **'Unable to open the camera. Please try again or choose from gallery.'**
  String get signupCameraOpenFailed;

  /// Gallery permission denied.
  ///
  /// In en, this message translates to:
  /// **'Photo library access is required to choose a photo. Enable photo permissions in your device settings if they were denied.'**
  String get signupGalleryPermissionDenied;

  /// Gallery open failure.
  ///
  /// In en, this message translates to:
  /// **'Unable to open the photo library. Please try again.'**
  String get signupGalleryOpenFailed;

  /// Parent role card description.
  ///
  /// In en, this message translates to:
  /// **'Monitor your child\'s progress, communicate with specialists, and complete home exercises.'**
  String get signupRoleParentDescription;

  /// Specialist role card description.
  ///
  /// In en, this message translates to:
  /// **'Manage patients, create treatment plans, review progress, and provide professional guidance.'**
  String get signupRoleSpecialistDescription;

  /// Signup wizard step indicator.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String signupStepProgress(int current, int total);

  /// Profile photo picker label.
  ///
  /// In en, this message translates to:
  /// **'Profile Photo'**
  String get signupProfilePhoto;

  /// Profile photo change hint.
  ///
  /// In en, this message translates to:
  /// **'Tap to change photo'**
  String get signupProfilePhotoTapChange;

  /// Profile photo upload hint.
  ///
  /// In en, this message translates to:
  /// **'Click to upload'**
  String get signupProfilePhotoTapUpload;

  /// Accessibility label when photo exists.
  ///
  /// In en, this message translates to:
  /// **'Profile photo, tap to change'**
  String get signupProfilePhotoSemanticChange;

  /// Accessibility label when no photo.
  ///
  /// In en, this message translates to:
  /// **'Profile photo, tap to upload'**
  String get signupProfilePhotoSemanticUpload;

  /// Photo source sheet title.
  ///
  /// In en, this message translates to:
  /// **'Choose Profile Photo'**
  String get signupChooseProfilePhoto;

  /// Camera option title.
  ///
  /// In en, this message translates to:
  /// **'Take a Photo'**
  String get signupTakePhoto;

  /// Camera option subtitle.
  ///
  /// In en, this message translates to:
  /// **'Use your camera to capture a new photo.'**
  String get signupTakePhotoSubtitle;

  /// Camera option accessibility.
  ///
  /// In en, this message translates to:
  /// **'Take a photo with camera'**
  String get signupTakePhotoSemantic;

  /// Gallery option title.
  ///
  /// In en, this message translates to:
  /// **'Choose from Gallery'**
  String get signupChooseFromGallery;

  /// Gallery option subtitle.
  ///
  /// In en, this message translates to:
  /// **'Select an existing photo from your device.'**
  String get signupChooseFromGallerySubtitle;

  /// Gallery option accessibility.
  ///
  /// In en, this message translates to:
  /// **'Choose a photo from gallery'**
  String get signupChooseFromGallerySemantic;

  /// Cancel photo sheet accessibility.
  ///
  /// In en, this message translates to:
  /// **'Cancel profile photo selection'**
  String get signupCancelPhotoSelection;

  /// Full name field hint.
  ///
  /// In en, this message translates to:
  /// **'Dr. Sarah Johnson'**
  String get signupFullNameHint;

  /// Full name field hint when Parent role is selected.
  ///
  /// In en, this message translates to:
  /// **'Sarah Mohammad'**
  String get signupFullNameHintParent;

  /// Full name field hint when Specialist role is selected.
  ///
  /// In en, this message translates to:
  /// **'Dr. Sarah Mohammad'**
  String get signupFullNameHintSpecialist;

  /// Email address field label.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get signupEmailAddress;

  /// Phone number field label.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get signupPhoneNumber;

  /// Phone field hint.
  ///
  /// In en, this message translates to:
  /// **'+970 59 000 0000'**
  String get signupPhoneHint;

  /// Specialization field hint.
  ///
  /// In en, this message translates to:
  /// **'Speech Therapy'**
  String get signupSpecializationHint;

  /// Bio field hint.
  ///
  /// In en, this message translates to:
  /// **'Brief professional bio'**
  String get signupBioHint;

  /// Bio character counter.
  ///
  /// In en, this message translates to:
  /// **'{length} / 500'**
  String signupBioCounter(int length);

  /// Password field hint on signup.
  ///
  /// In en, this message translates to:
  /// **'Min. 8 characters'**
  String get signupPasswordHint;

  /// Confirm password label on signup.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get signupConfirmPassword;

  /// Confirm password hint on signup.
  ///
  /// In en, this message translates to:
  /// **'Re-enter your password'**
  String get signupConfirmPasswordHint;

  /// Terms checkbox label.
  ///
  /// In en, this message translates to:
  /// **'I agree to the Terms of Service and Privacy Policy.'**
  String get signupTermsAgreement;

  /// Review section account type.
  ///
  /// In en, this message translates to:
  /// **'Account Type'**
  String get signupAccountType;

  /// Review section personal details.
  ///
  /// In en, this message translates to:
  /// **'Personal Details'**
  String get signupPersonalDetails;

  /// Review section professional details.
  ///
  /// In en, this message translates to:
  /// **'Professional Details'**
  String get signupProfessionalDetails;

  /// Review section security.
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get signupSecuritySection;

  /// Review experience label.
  ///
  /// In en, this message translates to:
  /// **'Experience'**
  String get signupExperience;

  /// Review section edit button.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get signupEdit;

  /// Review security summary.
  ///
  /// In en, this message translates to:
  /// **'Password created securely'**
  String get signupPasswordCreatedSecurely;

  /// Review disclaimer.
  ///
  /// In en, this message translates to:
  /// **'By creating this account, you confirm that the information above is accurate.'**
  String get signupReviewConfirmAccuracy;

  /// Create account button loading.
  ///
  /// In en, this message translates to:
  /// **'Creating Account...'**
  String get signupCreatingAccount;

  /// Years of experience display.
  ///
  /// In en, this message translates to:
  /// **'{count} years'**
  String signupExperienceYears(int count);

  /// Single year experience display.
  ///
  /// In en, this message translates to:
  /// **'1 year'**
  String get signupExperienceOneYear;

  /// Specialization validation.
  ///
  /// In en, this message translates to:
  /// **'Specialization is required.'**
  String get signupValidationSpecializationRequired;

  /// Specialization max length.
  ///
  /// In en, this message translates to:
  /// **'Specialization must not exceed 150 characters.'**
  String get signupValidationSpecializationMax;

  /// License validation.
  ///
  /// In en, this message translates to:
  /// **'License number is required.'**
  String get signupValidationLicenseRequired;

  /// License max length.
  ///
  /// In en, this message translates to:
  /// **'License number must not exceed 100 characters.'**
  String get signupValidationLicenseMax;

  /// Experience required.
  ///
  /// In en, this message translates to:
  /// **'Years of experience is required.'**
  String get signupValidationExperienceRequired;

  /// Experience minimum.
  ///
  /// In en, this message translates to:
  /// **'Years of experience must be at least 0.'**
  String get signupValidationExperienceMin;

  /// Bio max length.
  ///
  /// In en, this message translates to:
  /// **'Bio must not exceed 500 characters.'**
  String get signupValidationBioMax;

  /// Forgot password screen title.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get forgotPasswordTitle;

  /// Forgot password instructions.
  ///
  /// In en, this message translates to:
  /// **'Enter your email address and we will send you a password reset link.'**
  String get forgotPasswordSubtitle;

  /// Empty email validation.
  ///
  /// In en, this message translates to:
  /// **'Please enter your email address'**
  String get forgotPasswordEnterEmail;

  /// Invalid email validation.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get forgotPasswordEnterValidEmail;

  /// Sending reset link button.
  ///
  /// In en, this message translates to:
  /// **'Sending Reset Link...'**
  String get forgotPasswordSending;

  /// Send reset link button.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Link'**
  String get forgotPasswordSendLink;

  /// Success title.
  ///
  /// In en, this message translates to:
  /// **'Reset Email Sent'**
  String get forgotPasswordResetEmailSentTitle;

  /// Success message.
  ///
  /// In en, this message translates to:
  /// **'If an account exists with this email, a password reset link has been sent.'**
  String get forgotPasswordResetEmailSentMessage;

  /// Failed to send reset link.
  ///
  /// In en, this message translates to:
  /// **'Failed to send reset link.'**
  String get forgotPasswordFailedSend;

  /// Return to login link.
  ///
  /// In en, this message translates to:
  /// **'Back to Sign In'**
  String get forgotPasswordBackToSignIn;

  /// Reset password screen title.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPasswordTitle;

  /// Reset password instructions.
  ///
  /// In en, this message translates to:
  /// **'Enter your new password below.'**
  String get resetPasswordSubtitle;

  /// New password label.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get resetPasswordNewPassword;

  /// New password hint.
  ///
  /// In en, this message translates to:
  /// **'Enter your new password'**
  String get resetPasswordNewPasswordHint;

  /// Confirm password label.
  ///
  /// In en, this message translates to:
  /// **'Confirm New Password'**
  String get resetPasswordConfirmPassword;

  /// Confirm password hint.
  ///
  /// In en, this message translates to:
  /// **'Re-enter your new password'**
  String get resetPasswordConfirmHint;

  /// Reset button loading.
  ///
  /// In en, this message translates to:
  /// **'Resetting Password...'**
  String get resetPasswordResetting;

  /// Success title.
  ///
  /// In en, this message translates to:
  /// **'Password Reset Complete'**
  String get resetPasswordCompleteTitle;

  /// Success message.
  ///
  /// In en, this message translates to:
  /// **'Your password has been changed successfully.'**
  String get resetPasswordCompleteMessage;

  /// Reset failure message.
  ///
  /// In en, this message translates to:
  /// **'Failed to reset password.'**
  String get resetPasswordFailed;

  /// Return to login.
  ///
  /// In en, this message translates to:
  /// **'Back to Sign In'**
  String get resetPasswordBackToSignIn;

  /// Initial verify email message.
  ///
  /// In en, this message translates to:
  /// **'Please check your email and open the verification link on this device.'**
  String get verifyEmailPendingMessage;

  /// Pending verification title.
  ///
  /// In en, this message translates to:
  /// **'Check Your Email'**
  String get verifyEmailCheckTitle;

  /// Pending verification message.
  ///
  /// In en, this message translates to:
  /// **'We sent a verification link to your email address. Open the link on this device to activate your account.'**
  String get verifyEmailCheckMessage;

  /// Loading verification title.
  ///
  /// In en, this message translates to:
  /// **'Verifying Email'**
  String get verifyEmailVerifyingTitle;

  /// Loading verification message.
  ///
  /// In en, this message translates to:
  /// **'We are verifying your email now.'**
  String get verifyEmailVerifyingMessage;

  /// Verification success title.
  ///
  /// In en, this message translates to:
  /// **'Email Verified'**
  String get verifyEmailSuccessTitle;

  /// Verification success message.
  ///
  /// In en, this message translates to:
  /// **'Your email has been verified successfully. You can now sign in.'**
  String get verifyEmailSuccessMessage;

  /// Go to login button.
  ///
  /// In en, this message translates to:
  /// **'Go to Login'**
  String get verifyEmailGoToLogin;

  /// Verification failed title.
  ///
  /// In en, this message translates to:
  /// **'Verification Failed'**
  String get verifyEmailFailedTitle;

  /// Verification failed default.
  ///
  /// In en, this message translates to:
  /// **'Unable to verify your email right now.'**
  String get verifyEmailFailedDefault;

  /// Resend button loading.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get verifyEmailResending;

  /// Resend verification button.
  ///
  /// In en, this message translates to:
  /// **'Resend Verification Email'**
  String get verifyEmailResend;

  /// Hide manual token input.
  ///
  /// In en, this message translates to:
  /// **'Hide manual verification'**
  String get verifyEmailHideManual;

  /// Show manual token input.
  ///
  /// In en, this message translates to:
  /// **'Already have a verification link?'**
  String get verifyEmailShowManual;

  /// Manual token field label.
  ///
  /// In en, this message translates to:
  /// **'Verification link or token'**
  String get verifyEmailTokenLabel;

  /// Manual token field hint.
  ///
  /// In en, this message translates to:
  /// **'Paste the link or token from your email'**
  String get verifyEmailTokenHint;

  /// Verify email button.
  ///
  /// In en, this message translates to:
  /// **'Verify Email'**
  String get verifyEmailVerifyButton;

  /// Empty token validation.
  ///
  /// In en, this message translates to:
  /// **'Enter the verification token or paste the full verification link.'**
  String get verifyEmailEnterToken;

  /// Missing email for resend.
  ///
  /// In en, this message translates to:
  /// **'Email address is missing. Please sign up again or contact support.'**
  String get verifyEmailEmailMissing;

  /// Resend failure fallback.
  ///
  /// In en, this message translates to:
  /// **'Unable to resend the verification email right now.'**
  String get verifyEmailResendFailed;

  /// Back to login link.
  ///
  /// In en, this message translates to:
  /// **'Back to Sign In'**
  String get verifyEmailBackToSignIn;

  /// Splash title first line (Arabic only).
  ///
  /// In en, this message translates to:
  /// **''**
  String get splashTitleLine1;

  /// Splash title leading word or Arabic middle line.
  ///
  /// In en, this message translates to:
  /// **'Smart'**
  String get splashTitleSmart;

  /// Splash title accent word or Arabic final line.
  ///
  /// In en, this message translates to:
  /// **'Rehabilitation'**
  String get splashTitleRehabilitation;

  /// Splash subtitle.
  ///
  /// In en, this message translates to:
  /// **'Empowering rehabilitation through smart daily follow-up'**
  String get splashSubtitle;

  /// Splash feature pill.
  ///
  /// In en, this message translates to:
  /// **'AI Progress Tracking'**
  String get splashFeatureAiProgress;

  /// Splash feature pill.
  ///
  /// In en, this message translates to:
  /// **'Smart Exercise Guidance'**
  String get splashFeatureExerciseGuidance;

  /// Splash feature pill.
  ///
  /// In en, this message translates to:
  /// **'Speech & Motion Analysis'**
  String get splashFeatureSpeechMotion;

  /// Splash CTA button.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get splashGetStarted;

  /// Splash footer copyright.
  ///
  /// In en, this message translates to:
  /// **'© Smart Rehabilitation Platform'**
  String get splashCopyright;

  /// Parent AI assistant subtitle with child name.
  ///
  /// In en, this message translates to:
  /// **'For {childName}'**
  String parentAiAssistantForChild(String childName);

  /// Safety disclaimer on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'AI guidance is for support only. Always follow your specialist\'s instructions.'**
  String get parentAiAssistantDisclaimer;

  /// Empty-state intro on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'Ask me anything about your child\'s exercises, reports, or progress.'**
  String get parentAiAssistantIntro;

  /// Suggested prompt on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'Explain today\'s exercise'**
  String get parentAiAssistantPromptExplainExercise;

  /// Suggested prompt on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'Summarize my child\'s progress'**
  String get parentAiAssistantPromptSummarizeProgress;

  /// Suggested prompt on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'What should I focus on today?'**
  String get parentAiAssistantPromptFocusToday;

  /// Suggested prompt on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'Explain the latest report'**
  String get parentAiAssistantPromptExplainReport;

  /// Input hint on the parent AI assistant screen.
  ///
  /// In en, this message translates to:
  /// **'Ask about exercises, reports, or progress...'**
  String get parentAiAssistantInputHint;

  /// Loading indicator while waiting for an AI response.
  ///
  /// In en, this message translates to:
  /// **'AI is thinking...'**
  String get parentAiAssistantThinking;

  /// Message pending state in the parent AI assistant chat.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get parentAiAssistantSending;

  /// Message failed state in the parent AI assistant chat.
  ///
  /// In en, this message translates to:
  /// **'Failed to send'**
  String get parentAiAssistantFailedToSend;

  /// Parent More page item to submit a specialist complaint.
  ///
  /// In en, this message translates to:
  /// **'Report a Specialist'**
  String get complaintMoreReportSpecialist;

  /// Subtitle for the Report a Specialist More page item.
  ///
  /// In en, this message translates to:
  /// **'Submit a concern for administration review'**
  String get complaintMoreReportSpecialistSubtitle;

  /// Title for the parent specialist complaint form.
  ///
  /// In en, this message translates to:
  /// **'Report a Specialist'**
  String get complaintFormTitle;

  /// Intro text on the complaint form.
  ///
  /// In en, this message translates to:
  /// **'Your complaint will be reviewed by the administration only. It will not be sent directly to the specialist.'**
  String get complaintFormIntro;

  /// Title for the parent complaints history screen.
  ///
  /// In en, this message translates to:
  /// **'My Complaints'**
  String get complaintHistoryTitle;

  /// Child selector label on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get complaintFormChildLabel;

  /// Specialist selector label on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get complaintFormSpecialistLabel;

  /// Category selector label on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Complaint Category'**
  String get complaintFormCategoryLabel;

  /// Description field label on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get complaintFormDescriptionLabel;

  /// Description field hint on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Describe your concern in detail (minimum 20 characters)'**
  String get complaintFormDescriptionHint;

  /// Character counter for complaint description.
  ///
  /// In en, this message translates to:
  /// **'{count}/1000'**
  String complaintFormDescriptionCounter(int count);

  /// Validation when complaint description is too short.
  ///
  /// In en, this message translates to:
  /// **'Description must be at least 20 characters.'**
  String get complaintFormDescriptionTooShort;

  /// Validation when complaint description is too long.
  ///
  /// In en, this message translates to:
  /// **'Description must not exceed 1000 characters.'**
  String get complaintFormDescriptionTooLong;

  /// Validation when child is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a child.'**
  String get complaintFormSelectChild;

  /// Validation when specialist is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a specialist.'**
  String get complaintFormSelectSpecialist;

  /// Validation when category is not selected.
  ///
  /// In en, this message translates to:
  /// **'Please select a complaint category.'**
  String get complaintFormSelectCategory;

  /// Shown when selected child has no assigned specialists.
  ///
  /// In en, this message translates to:
  /// **'No specialist is assigned to this child.'**
  String get complaintFormNoSpecialistAssigned;

  /// Attachment section label on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Attachment (optional)'**
  String get complaintFormAttachmentLabel;

  /// Attachment hint on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Supported formats: image or PDF.'**
  String get complaintFormAttachmentHint;

  /// Button to add an attachment.
  ///
  /// In en, this message translates to:
  /// **'Add attachment'**
  String get complaintFormAddAttachment;

  /// Tooltip to remove selected attachment.
  ///
  /// In en, this message translates to:
  /// **'Remove attachment'**
  String get complaintFormRemoveAttachment;

  /// Error when attachment picker fails.
  ///
  /// In en, this message translates to:
  /// **'Could not read the selected file.'**
  String get complaintFormAttachmentPickFailed;

  /// Error when attachment upload fails.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload attachment. Please try again.'**
  String get complaintFormAttachmentUploadFailed;

  /// Submit button on complaint form.
  ///
  /// In en, this message translates to:
  /// **'Submit Complaint'**
  String get complaintFormSubmit;

  /// Submit button label while submitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get complaintFormSubmitting;

  /// Success message after complaint submission.
  ///
  /// In en, this message translates to:
  /// **'Your complaint has been submitted successfully and will be reviewed by the administration.'**
  String get complaintFormSubmittedSuccess;

  /// Generic submit failure message.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit complaint. Please try again.'**
  String get complaintFormSubmitFailed;

  /// Error when duplicate active complaint exists.
  ///
  /// In en, this message translates to:
  /// **'An active complaint already exists for this child, specialist, and category.'**
  String get complaintFormDuplicateActiveError;

  /// Error when specialist is not assigned.
  ///
  /// In en, this message translates to:
  /// **'The selected specialist is not assigned to this child.'**
  String get complaintFormSpecialistNotAssigned;

  /// Error when parent is not linked to child.
  ///
  /// In en, this message translates to:
  /// **'You are not authorized to submit a complaint for this child.'**
  String get complaintFormChildNotAuthorized;

  /// Error when complaint form initial data fails to load.
  ///
  /// In en, this message translates to:
  /// **'Failed to load form data: {error}'**
  String complaintFormLoadFailed(String error);

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Specialist is not responding'**
  String get complaintCategorySpecialistNotResponding;

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Poor follow-up'**
  String get complaintCategoryPoorFollowUp;

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Missed or repeatedly cancelled sessions'**
  String get complaintCategoryRepeatedSessionCancellations;

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Delayed exercise feedback'**
  String get complaintCategoryDelayedExerciseFeedback;

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Inappropriate communication'**
  String get complaintCategoryInappropriateCommunication;

  /// Complaint category label.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get complaintCategoryOther;

  /// Complaint status label.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get complaintStatusPending;

  /// Complaint status label.
  ///
  /// In en, this message translates to:
  /// **'Under Review'**
  String get complaintStatusUnderReview;

  /// Complaint status label.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get complaintStatusResolved;

  /// Complaint status label.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get complaintStatusRejected;

  /// Empty state title for parent complaints list.
  ///
  /// In en, this message translates to:
  /// **'No complaints yet'**
  String get complaintHistoryEmptyTitle;

  /// Empty state message for parent complaints list.
  ///
  /// In en, this message translates to:
  /// **'If you have a concern about an assigned specialist, you can submit a complaint for administration review.'**
  String get complaintHistoryEmptyMessage;

  /// Child and specialist line on complaint list item.
  ///
  /// In en, this message translates to:
  /// **'{childName} · {specialistName}'**
  String complaintHistoryChildSpecialist(
    String childName,
    String specialistName,
  );

  /// Fallback when complaint date is missing.
  ///
  /// In en, this message translates to:
  /// **'Date unavailable'**
  String get complaintDateUnavailable;

  /// Title for parent complaint details screen.
  ///
  /// In en, this message translates to:
  /// **'Complaint Details'**
  String get complaintDetailsTitle;

  /// Error when complaint details are unavailable.
  ///
  /// In en, this message translates to:
  /// **'Complaint not found.'**
  String get complaintDetailsNotFound;

  /// Label for complaint submission date.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get complaintDetailsSubmitted;

  /// Label for complaint status on details screen.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get complaintDetailsStatus;

  /// Parent-visible admin response on complaint details.
  ///
  /// In en, this message translates to:
  /// **'Administration Response'**
  String get complaintDetailsAdminResponse;

  /// Title for admin complaints inbox.
  ///
  /// In en, this message translates to:
  /// **'Complaints Management'**
  String get adminComplaintsTitle;

  /// Intro text on admin complaints screen.
  ///
  /// In en, this message translates to:
  /// **'Review specialist complaints submitted by parents and manage review actions.'**
  String get adminComplaintsDescription;

  /// Loading message on admin complaints screen.
  ///
  /// In en, this message translates to:
  /// **'Loading complaints...'**
  String get adminComplaintsLoading;

  /// Empty state when no complaints exist.
  ///
  /// In en, this message translates to:
  /// **'No complaints found.'**
  String get adminComplaintsEmpty;

  /// Empty state when filters hide all complaints.
  ///
  /// In en, this message translates to:
  /// **'No complaints match the selected filters.'**
  String get adminComplaintsNoMatch;

  /// Status filter option for all complaint statuses.
  ///
  /// In en, this message translates to:
  /// **'All Statuses'**
  String get adminComplaintsAllStatuses;

  /// Category filter option for all complaint categories.
  ///
  /// In en, this message translates to:
  /// **'All Categories'**
  String get adminComplaintsAllCategories;

  /// Specialist filter option for all specialists.
  ///
  /// In en, this message translates to:
  /// **'All Specialists'**
  String get adminComplaintsAllSpecialists;

  /// Date range filter label.
  ///
  /// In en, this message translates to:
  /// **'Date range'**
  String get adminComplaintsDateRange;

  /// Chip label when date range filter is active.
  ///
  /// In en, this message translates to:
  /// **'Date range selected'**
  String get adminComplaintsDateRangeSelected;

  /// Parent name label on admin complaint card.
  ///
  /// In en, this message translates to:
  /// **'Parent: {name}'**
  String adminComplaintsParentLabel(String name);

  /// Child name label on admin complaint card.
  ///
  /// In en, this message translates to:
  /// **'Child: {name}'**
  String adminComplaintsChildLabel(String name);

  /// Specialist name label on admin complaint card.
  ///
  /// In en, this message translates to:
  /// **'Specialist: {name}'**
  String adminComplaintsSpecialistLabel(String name);

  /// Title for admin complaint details screen.
  ///
  /// In en, this message translates to:
  /// **'Complaint Details'**
  String get adminComplaintDetailsTitle;

  /// Parent field label on admin complaint details.
  ///
  /// In en, this message translates to:
  /// **'Parent'**
  String get adminComplaintFieldParent;

  /// Child field label on admin complaint details.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get adminComplaintFieldChild;

  /// Specialist field label on admin complaint details.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get adminComplaintFieldSpecialist;

  /// Reviewer label on admin complaint details.
  ///
  /// In en, this message translates to:
  /// **'Reviewed by'**
  String get adminComplaintReviewer;

  /// Review date label on admin complaint details.
  ///
  /// In en, this message translates to:
  /// **'Review date'**
  String get adminComplaintReviewedAt;

  /// Admin notes field label.
  ///
  /// In en, this message translates to:
  /// **'Admin notes'**
  String get adminComplaintAdminNotes;

  /// Hint for admin notes field.
  ///
  /// In en, this message translates to:
  /// **'Required when resolving or rejecting a complaint'**
  String get adminComplaintAdminNotesHint;

  /// Validation when admin notes are missing.
  ///
  /// In en, this message translates to:
  /// **'Admin notes are required to resolve or reject this complaint.'**
  String get adminComplaintAdminNotesRequired;

  /// Optional parent-facing response field.
  ///
  /// In en, this message translates to:
  /// **'Parent response (optional)'**
  String get adminComplaintParentResponse;

  /// Hint for parent response field.
  ///
  /// In en, this message translates to:
  /// **'Safe message visible to the parent after review'**
  String get adminComplaintParentResponseHint;

  /// Button to start complaint review.
  ///
  /// In en, this message translates to:
  /// **'Start Review'**
  String get adminComplaintStartReview;

  /// Confirmation dialog title for start review.
  ///
  /// In en, this message translates to:
  /// **'Start review?'**
  String get adminComplaintStartReviewTitle;

  /// Confirmation dialog message for start review.
  ///
  /// In en, this message translates to:
  /// **'This complaint will be marked as under review.'**
  String get adminComplaintStartReviewMessage;

  /// Success message after starting review.
  ///
  /// In en, this message translates to:
  /// **'Complaint marked as under review.'**
  String get adminComplaintStartReviewSuccess;

  /// Button to resolve complaint.
  ///
  /// In en, this message translates to:
  /// **'Resolve Complaint'**
  String get adminComplaintResolve;

  /// Confirmation dialog title for resolve.
  ///
  /// In en, this message translates to:
  /// **'Resolve complaint?'**
  String get adminComplaintResolveTitle;

  /// Confirmation dialog message for resolve.
  ///
  /// In en, this message translates to:
  /// **'This will confirm the complaint after review.'**
  String get adminComplaintResolveMessage;

  /// Success message after resolving complaint.
  ///
  /// In en, this message translates to:
  /// **'Complaint resolved successfully.'**
  String get adminComplaintResolveSuccess;

  /// Button to reject complaint.
  ///
  /// In en, this message translates to:
  /// **'Reject Complaint'**
  String get adminComplaintReject;

  /// Confirmation dialog title for reject.
  ///
  /// In en, this message translates to:
  /// **'Reject complaint?'**
  String get adminComplaintRejectTitle;

  /// Confirmation dialog message for reject.
  ///
  /// In en, this message translates to:
  /// **'This complaint will be marked as rejected after review.'**
  String get adminComplaintRejectMessage;

  /// Success message after rejecting complaint.
  ///
  /// In en, this message translates to:
  /// **'Complaint rejected successfully.'**
  String get adminComplaintRejectSuccess;

  /// Error when admin attempts invalid status transition.
  ///
  /// In en, this message translates to:
  /// **'This status change is not allowed for the current complaint.'**
  String get adminComplaintInvalidTransition;

  /// Specialist More item and support requests list title.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get supportRequestTitle;

  /// Admin More item and support requests inbox title.
  ///
  /// In en, this message translates to:
  /// **'Support Requests'**
  String get supportRequestAdminTitle;

  /// Intro text on admin support requests list.
  ///
  /// In en, this message translates to:
  /// **'Review and respond to specialist support requests.'**
  String get supportRequestAdminDescription;

  /// Button to create a new support request.
  ///
  /// In en, this message translates to:
  /// **'New Request'**
  String get supportRequestNewRequest;

  /// Specialist support request details screen title.
  ///
  /// In en, this message translates to:
  /// **'Support Request'**
  String get supportRequestDetailsTitle;

  /// Admin support request details screen title.
  ///
  /// In en, this message translates to:
  /// **'Support Request Details'**
  String get supportRequestAdminDetailsTitle;

  /// Category field label.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get supportRequestCategoryLabel;

  /// Subject field label.
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get supportRequestSubjectLabel;

  /// Description field label.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get supportRequestDescriptionLabel;

  /// Description field hint.
  ///
  /// In en, this message translates to:
  /// **'Describe your issue in detail (minimum 20 characters)'**
  String get supportRequestDescriptionHint;

  /// Character counter for support request description.
  ///
  /// In en, this message translates to:
  /// **'{count}/2000'**
  String supportRequestDescriptionCounter(int count);

  /// Attachment section label.
  ///
  /// In en, this message translates to:
  /// **'Attachment (optional)'**
  String get supportRequestAttachmentLabel;

  /// Button to pick an attachment.
  ///
  /// In en, this message translates to:
  /// **'Add attachment'**
  String get supportRequestAddAttachment;

  /// Submit support request button.
  ///
  /// In en, this message translates to:
  /// **'Submit Request'**
  String get supportRequestSubmitRequest;

  /// Submit in progress label.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get supportRequestSubmitting;

  /// Reply button label.
  ///
  /// In en, this message translates to:
  /// **'Reply'**
  String get supportRequestReply;

  /// Reply composer field label.
  ///
  /// In en, this message translates to:
  /// **'Your reply'**
  String get supportRequestReplyLabel;

  /// Reply composer hint.
  ///
  /// In en, this message translates to:
  /// **'Write your message...'**
  String get supportRequestReplyHint;

  /// Validation when reply is empty.
  ///
  /// In en, this message translates to:
  /// **'Enter a message or add an attachment.'**
  String get supportRequestReplyRequired;

  /// Reply send in progress label.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get supportRequestSending;

  /// Admin action to mark request in progress.
  ///
  /// In en, this message translates to:
  /// **'Mark In Progress'**
  String get supportRequestMarkInProgress;

  /// Admin action to mark request resolved.
  ///
  /// In en, this message translates to:
  /// **'Mark Resolved'**
  String get supportRequestMarkResolved;

  /// Confirmation dialog title.
  ///
  /// In en, this message translates to:
  /// **'Mark in progress?'**
  String get supportRequestMarkInProgressTitle;

  /// Confirmation dialog message.
  ///
  /// In en, this message translates to:
  /// **'This support request will be marked as in progress.'**
  String get supportRequestMarkInProgressMessage;

  /// Success message after marking in progress.
  ///
  /// In en, this message translates to:
  /// **'Support request marked as in progress.'**
  String get supportRequestMarkInProgressSuccess;

  /// Confirmation dialog title for resolve.
  ///
  /// In en, this message translates to:
  /// **'Mark resolved?'**
  String get supportRequestMarkResolvedTitle;

  /// Confirmation dialog message for resolve.
  ///
  /// In en, this message translates to:
  /// **'This support request will be marked as resolved and become read-only.'**
  String get supportRequestMarkResolvedMessage;

  /// Success message after resolving.
  ///
  /// In en, this message translates to:
  /// **'Support request marked as resolved.'**
  String get supportRequestMarkResolvedSuccess;

  /// Empty state when no support requests exist.
  ///
  /// In en, this message translates to:
  /// **'No support requests yet.'**
  String get supportRequestEmpty;

  /// Empty state when filters hide all requests.
  ///
  /// In en, this message translates to:
  /// **'No support requests match the selected filters.'**
  String get supportRequestNoMatch;

  /// Loading message.
  ///
  /// In en, this message translates to:
  /// **'Loading support requests...'**
  String get supportRequestLoading;

  /// Resolved banner title.
  ///
  /// In en, this message translates to:
  /// **'This request is resolved'**
  String get supportRequestResolvedTitle;

  /// Resolved read-only message.
  ///
  /// In en, this message translates to:
  /// **'The conversation is now read-only.'**
  String get supportRequestResolvedReadOnly;

  /// Thread section title.
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get supportRequestConversationTitle;

  /// Created date label.
  ///
  /// In en, this message translates to:
  /// **'Created'**
  String get supportRequestCreatedLabel;

  /// Last activity label.
  ///
  /// In en, this message translates to:
  /// **'Last activity'**
  String get supportRequestLastActivityLabel;

  /// Resolved date label.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get supportRequestResolvedDateLabel;

  /// Fallback when date is missing.
  ///
  /// In en, this message translates to:
  /// **'Date unavailable'**
  String get supportRequestDateUnavailable;

  /// Last activity line on list cards.
  ///
  /// In en, this message translates to:
  /// **'Last activity: {date}'**
  String supportRequestLastActivity(String date);

  /// Created date line on list cards.
  ///
  /// In en, this message translates to:
  /// **'Created: {date}'**
  String supportRequestCreatedDate(String date);

  /// Specialist name on admin list card.
  ///
  /// In en, this message translates to:
  /// **'Specialist: {name}'**
  String supportRequestSpecialistLabel(String name);

  /// Specialist field label on details.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get supportRequestSpecialistFieldLabel;

  /// Specialist email field label.
  ///
  /// In en, this message translates to:
  /// **'Specialist email'**
  String get supportRequestSpecialistEmailLabel;

  /// Admin message bubble label.
  ///
  /// In en, this message translates to:
  /// **'Administration'**
  String get supportRequestSenderAdmin;

  /// Specialist message bubble label.
  ///
  /// In en, this message translates to:
  /// **'Specialist'**
  String get supportRequestSenderSpecialist;

  /// Admin ticket status action row label.
  ///
  /// In en, this message translates to:
  /// **'Request status'**
  String get supportRequestRequestStatusLabel;

  /// Status filter option.
  ///
  /// In en, this message translates to:
  /// **'All Statuses'**
  String get supportRequestAllStatuses;

  /// Category filter option.
  ///
  /// In en, this message translates to:
  /// **'All Categories'**
  String get supportRequestAllCategories;

  /// Specialist filter option.
  ///
  /// In en, this message translates to:
  /// **'All Specialists'**
  String get supportRequestAllSpecialists;

  /// Validation when category missing.
  ///
  /// In en, this message translates to:
  /// **'Please select a category.'**
  String get supportRequestSelectCategory;

  /// Subject validation.
  ///
  /// In en, this message translates to:
  /// **'Subject must be at least 3 characters.'**
  String get supportRequestSubjectTooShort;

  /// Subject validation.
  ///
  /// In en, this message translates to:
  /// **'Subject must not exceed 200 characters.'**
  String get supportRequestSubjectTooLong;

  /// Description validation.
  ///
  /// In en, this message translates to:
  /// **'Description must be at least 20 characters.'**
  String get supportRequestDescriptionTooShort;

  /// Description validation.
  ///
  /// In en, this message translates to:
  /// **'Description must not exceed 2000 characters.'**
  String get supportRequestDescriptionTooLong;

  /// File picker failure.
  ///
  /// In en, this message translates to:
  /// **'Could not read the selected file.'**
  String get supportRequestAttachmentPickFailed;

  /// Upload failure.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload attachment.'**
  String get supportRequestAttachmentUploadFailed;

  /// Invalid attachment type.
  ///
  /// In en, this message translates to:
  /// **'Unsupported attachment type. Allowed: JPEG, PNG, WebP, and PDF.'**
  String get supportRequestAttachmentInvalidType;

  /// Attachment too large.
  ///
  /// In en, this message translates to:
  /// **'Attachment is too large. Maximum allowed size is 10 MB.'**
  String get supportRequestAttachmentTooLarge;

  /// PDF attachment link label.
  ///
  /// In en, this message translates to:
  /// **'Open PDF attachment'**
  String get supportRequestAttachmentOpenPdf;

  /// Image attachment fallback label.
  ///
  /// In en, this message translates to:
  /// **'Open image attachment'**
  String get supportRequestAttachmentOpenImage;

  /// Error when acting on resolved request.
  ///
  /// In en, this message translates to:
  /// **'This support request is resolved and cannot be updated.'**
  String get supportRequestErrorResolved;

  /// 404 error message.
  ///
  /// In en, this message translates to:
  /// **'Support request not found.'**
  String get supportRequestErrorNotFound;

  /// 403 error message.
  ///
  /// In en, this message translates to:
  /// **'You are not authorized to access this support request.'**
  String get supportRequestErrorForbidden;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Technical Issue'**
  String get supportRequestCategoryTechnicalIssue;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Patient / Case Issue'**
  String get supportRequestCategoryPatientCaseIssue;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Session / Scheduling Issue'**
  String get supportRequestCategorySessionSchedulingIssue;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Account / Profile Issue'**
  String get supportRequestCategoryAccountProfileIssue;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Exercise / Content Issue'**
  String get supportRequestCategoryExerciseContentIssue;

  /// Support request category label.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get supportRequestCategoryOther;

  /// Support request status label.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get supportRequestStatusPending;

  /// Support request status label.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get supportRequestStatusInProgress;

  /// Support request status label.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get supportRequestStatusResolved;

  /// Pending specialist verification title.
  ///
  /// In en, this message translates to:
  /// **'Professional Verification Pending'**
  String get specialistVerificationPendingTitle;

  /// Pending specialist verification message.
  ///
  /// In en, this message translates to:
  /// **'Your email is verified. An administrator is reviewing your professional credentials. Specialist clinical features will be available after approval.'**
  String get specialistVerificationPendingMessage;

  /// Rejected specialist verification title.
  ///
  /// In en, this message translates to:
  /// **'Professional Verification Not Approved'**
  String get specialistVerificationRejectedTitle;

  /// Rejected specialist verification message.
  ///
  /// In en, this message translates to:
  /// **'Your specialist verification was not approved. Please contact platform administration or support for help.'**
  String get specialistVerificationRejectedMessage;

  /// Check verification status button.
  ///
  /// In en, this message translates to:
  /// **'Check Status'**
  String get specialistVerificationCheckStatus;

  /// Toast when still pending.
  ///
  /// In en, this message translates to:
  /// **'Your account is still pending admin review.'**
  String get specialistVerificationStillPending;

  /// Logout button on verification screens.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get specialistVerificationLogout;

  /// Logout in progress label.
  ///
  /// In en, this message translates to:
  /// **'Signing out...'**
  String get specialistVerificationLoggingOut;

  /// Logout failure message.
  ///
  /// In en, this message translates to:
  /// **'Unable to sign out right now.'**
  String get specialistVerificationLogoutFailed;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
