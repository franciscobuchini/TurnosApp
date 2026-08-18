import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Background from './components/layout/Background';
import Home from './pages/landing/Home';
import Terms from './pages/landing/Terms';
import Dashboard, { useAdminContext } from './pages/admin/Dashboard';
import Personalizacion from './pages/admin/Personalizacion';
import SettingsBusinessView from './components/views/SettingsBusinessView';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';
import Site from './pages/clients/Site';
import { getBlockedMemberNames } from './functions/scheduleCellAvailability';
import { UnsavedChangesProvider } from './hooks/useUnsavedChanges';

import ScheduleView from './components/views/ScheduleView';
import AddEntityView, { ADD_ENTITY_VIEW_TITLE } from './components/views/EntityView';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from './components/views/ServiceView';
import AddClientView, { ADD_CLIENT_VIEW_TITLE } from './components/views/ClientView';

type CrudMode = 'create' | 'view' | 'edit';

function SchedulePage() {
  const ctx = useAdminContext();

  /* En el flujo "Agregar turno", las columnas de miembros que no tienen
     marcado el servicio seleccionado quedan bloqueadas. */
  const blockedMembers = useMemo(
    () => getBlockedMemberNames(ctx.addShiftOpen ? ctx.shiftService : null),
    [ctx.addShiftOpen, ctx.shiftService],
  );

  return (
    <ScheduleView
      selectedMembers={ctx.selectedMembers}
      viewDate={ctx.viewDate}
      selectedDate={ctx.selectedDate}
      onViewDateChange={ctx.setViewDate}
      onSelectDate={ctx.setSelectedDate}
      selectedClientName={ctx.selectedClientName ?? undefined}
      blockedMembers={blockedMembers}
      previewService={ctx.addShiftOpen ? ctx.shiftService : null}
      pendingSlot={ctx.shiftSlot}
      onSlotClick={ctx.selectShiftSlot}
      onAppointmentClick={ctx.addShiftOpen ? undefined : ctx.openEditAppointment}
      onBlockClick={ctx.addShiftOpen ? undefined : ctx.openEditBlock}
      appointmentsVersion={ctx.appointmentsVersion}
      scrollToTime={ctx.scrollToTime}
      onScrollConsumed={ctx.clearScrollToTime}
      onOpenAddShift={ctx.openAddShift}
      addShiftOpen={ctx.addShiftOpen}
      onCloseAddShift={ctx.closeAddShift}
      blockModeOpen={ctx.blockModeOpen}
      onToggleBlockMode={ctx.toggleBlockMode}
      onNoticeMessage={ctx.setShiftNoticeMessage}
      onToggleBusinessDayBlock={ctx.toggleBusinessDayBlock}
      onBlocksVersionChange={ctx.incrementBlocksVersion}
      teamFilters={ctx.teamFilters}
      toggleTeamFilter={ctx.toggleTeamFilter}
      onMemberDetails={(name) => ctx.navigate(`/admin/miembro/${encodeURIComponent(name)}`)}
      blocksVersion={ctx.blocksVersion}
    />
  );
}

function EntityPage({ mode }: { mode: 'create' | 'view' }) {
  const ctx = useAdminContext();
  const { name } = useParams();

  return (
    <AddEntityView
      key={name ?? 'new-member'}
      open={true}
      onClose={() => ctx.navigate('/admin')}
      title={mode === 'create' ? ADD_ENTITY_VIEW_TITLE : `Perfil de ${name}`}
      mode={mode}
      memberName={mode === 'view' ? name : undefined}
      onConfirm={
        mode === 'create'
          ? (member) => ctx.createMember(member)
          : (member) => ctx.updateMember(name as string, member)
      }
      onDelete={mode === 'view' ? () => ctx.deleteMember(name as string) : undefined}
    />
  );
}

function ServicePage({ mode }: { mode: CrudMode }) {
  const ctx = useAdminContext();
  const { name } = useParams();

  return (
    <AddServiceView
      key={name ?? 'new-service'}
      open={true}
      onClose={() => ctx.navigate('/admin')}
      title={
        mode === 'create'
          ? ADD_SERVICE_VIEW_TITLE
          : mode === 'edit'
            ? `Editar ${name}`
            : `Detalles de ${name}`
      }
      mode={mode}
      serviceName={mode === 'create' ? undefined : name}
      onEdit={() => ctx.navigate(`/admin/servicio/${encodeURIComponent(name as string)}/editar`)}
      onCancel={() =>
        ctx.navigate(mode === 'edit' ? `/admin/servicio/${encodeURIComponent(name as string)}` : '/admin')
      }
      onConfirm={
        mode === 'create'
          ? (service) => ctx.createService(service)
          : (service) => ctx.updateService(name as string, service)
      }
      onDelete={mode !== 'create' ? () => ctx.deleteService(name as string) : undefined}
    />
  );
}

function ClientPage({ mode }: { mode: CrudMode }) {
  const ctx = useAdminContext();
  const { name } = useParams();

  return (
    <AddClientView
      key={name ?? 'new-client'}
      open={true}
      onClose={() => ctx.navigate('/admin')}
      title={
        mode === 'create'
          ? ADD_CLIENT_VIEW_TITLE
          : mode === 'edit'
            ? `Editar ${name}`
            : `Acerca de ${name}`
      }
      mode={mode}
      clientName={mode === 'create' ? undefined : name}
      clients={ctx.clients}
      onEdit={() => ctx.navigate(`/admin/cliente/${encodeURIComponent(name as string)}/editar`)}
      onCancel={() =>
        ctx.navigate(mode === 'edit' ? `/admin/cliente/${encodeURIComponent(name as string)}` : '/admin')
      }
      onConfirm={
        mode === 'create'
          ? (client) => ctx.createClient(client)
          : (client) => ctx.updateClient(name as string, client)
      }
      onDelete={mode !== 'create' ? () => ctx.deleteClient(name as string) : undefined}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <UnsavedChangesProvider>
      <div className="relative isolate min-h-dvh">
      <Background />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/site" element={<Site />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/personalizacion" element={<Personalizacion />} />

        <Route path="/SettingsView" element={<Navigate to="/admin/ajustes" replace />} />
        <Route path="/SettingsView/horarios" element={<Navigate to="/admin/ajustes" replace />} />
        <Route path="/SettingsView/seguridad" element={<Navigate to="/admin/ajustes" replace />} />

        <Route path="/admin" element={<Dashboard />}>
          <Route index element={<SchedulePage />} />
          <Route path="ajustes" element={<SettingsBusinessView />} />

          <Route path="metricas" element={<AdminPlaceholderPage subtitle="Métricas del negocio" />} />
          <Route path="marketing" element={<AdminPlaceholderPage subtitle="Herramientas de marketing" />} />
          <Route path="miembro" element={<EntityPage mode="create" />} />
          <Route path="miembro/:name" element={<EntityPage mode="view" />} />
          <Route path="servicio" element={<ServicePage mode="create" />} />
          <Route path="servicio/:name/editar" element={<ServicePage mode="edit" />} />
          <Route path="servicio/:name" element={<ServicePage mode="view" />} />
          <Route path="cliente" element={<ClientPage mode="create" />} />
          <Route path="cliente/:name/editar" element={<ClientPage mode="edit" />} />
          <Route path="cliente/:name" element={<ClientPage mode="view" />} />
        </Route>
      </Routes>
      </div>
      </UnsavedChangesProvider>
    </BrowserRouter>
  );
}

export default App;