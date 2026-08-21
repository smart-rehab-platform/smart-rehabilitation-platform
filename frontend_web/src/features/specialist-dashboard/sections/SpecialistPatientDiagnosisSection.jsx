import { useLocale } from "../../../context/useLocale";

function CurrentDiagnosisCard({ diagnosis, labels }) {
  if (!diagnosis) {
    return (
      <div className="pd-card pd-card-pad">
        <p className="pd-section-sub">{labels.noDiagnosis}</p>
      </div>
    );
  }

  return (
    <div className="pd-card pd-card-pad pd-specialist-diagnosis-current">
      <p className="pd-specialist-diagnosis-current-title" dir="auto">
        {diagnosis.title}
      </p>
      {diagnosis.diagnosedAtLabel ? (
        <p className="pd-section-sub">
          {labels.diagnosedOn(diagnosis.diagnosedAtLabel)}
        </p>
      ) : null}
      {diagnosis.description ? (
        <p className="pd-specialist-diagnosis-description" dir="auto">
          {diagnosis.description}
        </p>
      ) : null}
      {diagnosis.diagnosedByName ? (
        <p className="pd-section-sub">
          {labels.diagnosedBy(diagnosis.diagnosedByName)}
        </p>
      ) : null}
    </div>
  );
}

export function SpecialistPatientDiagnosisSection({ diagnoses }) {
  const { t } = useLocale();
  const labels = {
    sectionTitle: t("specialist.patientDetails.diagnosisSectionTitle"),
    currentDiagnosis: t("specialist.patientDetails.currentDiagnosis"),
    diagnosisHistory: t("specialist.patientDetails.diagnosisHistory"),
    noDiagnosis: t("specialist.patientDetails.noDiagnosis"),
    diagnosedOn: (date) => t("specialist.patientDetails.diagnosedOn", { date }),
    diagnosedBy: (name) => t("specialist.patientDetails.diagnosedBy", { name }),
  };

  const currentDiagnosis = diagnoses?.[0] ?? null;
  const historyItems = (diagnoses || []).slice(1);

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-diagnosis">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{labels.sectionTitle}</h2>
      </div>

      <div className="pd-specialist-diagnosis-block">
        <h3 className="pd-specialist-diagnosis-subheading">{labels.currentDiagnosis}</h3>
        <CurrentDiagnosisCard diagnosis={currentDiagnosis} labels={labels} />
      </div>

      {historyItems.length > 0 ? (
        <div className="pd-specialist-diagnosis-block">
          <h3 className="pd-specialist-diagnosis-subheading">{labels.diagnosisHistory}</h3>
          <div className="pd-specialist-patient-stack">
            {historyItems.map((item, index) => (
              <article
                key={item.id || `${item.title}-${item.diagnosedAt || index}`}
                className="pd-card pd-card-pad pd-specialist-diagnosis-history-row"
              >
                <div className="pd-specialist-diagnosis-history-main">
                  <p className="pd-specialist-diagnosis-history-title" dir="auto">
                    {item.title}
                  </p>
                  {item.diagnosedAtLabel ? (
                    <p className="pd-section-sub">{item.diagnosedAtLabel}</p>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="pd-specialist-diagnosis-description" dir="auto">
                    {item.description}
                  </p>
                ) : null}
                {item.diagnosedByName ? (
                  <p className="pd-section-sub">
                    {labels.diagnosedBy(item.diagnosedByName)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
