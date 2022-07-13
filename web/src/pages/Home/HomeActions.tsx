import { useState } from 'react';
import CreateModal from '../../components/CreateModal';
import ImportModal from '../../components/ImportModal';
import usePokemonCrud from '../../hooks/usePokemonCrud';
import * as S from './Home.styled';

const HomeActions = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { importPokemon, createPokemon } = usePokemonCrud();

  return (
    <>
      <S.ActionContainer>
        <S.CreateTestButton type="primary" onClick={() => setCreateModalOpen(true)}>
          Add Pokemon
        </S.CreateTestButton>
        <S.CreateTestButton type="primary" onClick={() => setImportModalOpen(true)}>
          Import Pokemon
        </S.CreateTestButton>
      </S.ActionContainer>

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={({ id }) => importPokemon.mutate({ id: +id })}
      />
      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={values => createPokemon.mutate(values)}
      />
    </>
  );
};

export default HomeActions;
