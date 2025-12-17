import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AgreementsLandingPage } from './components/AgreementsLandingPage';
import { AgreementPreview } from './components/AgreementPreview';
import AutofillAgreementPage from './App';

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agreements" replace />} />
        <Route path="/agreements" element={<AgreementsLandingPage />} />
        <Route path="/agreements/new" element={<AutofillAgreementPage />} />
        <Route path="/agreements/:id" element={<AgreementPreview />} />
        <Route path="/agreements/:id/edit" element={<AutofillAgreementPage />} />
      </Routes>
    </BrowserRouter>
  );
}
