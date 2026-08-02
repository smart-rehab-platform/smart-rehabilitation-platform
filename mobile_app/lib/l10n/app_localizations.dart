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
