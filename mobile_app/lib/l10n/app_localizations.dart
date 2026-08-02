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
  /// **'Smart Rehabilitation Platform'**
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

  /// Case intake request inbox or list.
  ///
  /// In en, this message translates to:
  /// **'Case Requests'**
  String get navCaseRequests;

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

  /// Greeting on the parent dashboard home screen.
  ///
  /// In en, this message translates to:
  /// **'Welcome back, {userName}'**
  String parentDashboardWelcomeBack(String userName);

  /// Link to view all items in a dashboard section.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get parentDashboardSeeAll;

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

  /// Label for the upcoming therapy session countdown.
  ///
  /// In en, this message translates to:
  /// **'Next Session'**
  String get parentDashboardNextSession;

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

  /// Loading state for the parent dashboard.
  ///
  /// In en, this message translates to:
  /// **'Loading dashboard...'**
  String get parentDashboardLoading;

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
