import { useParams, useNavigate } from 'react-router-dom';
import { ingredientById } from '../data/ingredients';
import { IngredientPanel } from '../components/IngredientPanel';
import { DishImage } from '../components/DishImage';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function Ingredient() {
  const { slug } = useParams();
  const nav = useNavigate();
  const info = slug ? ingredientById(slug) : undefined;
  useSeo(info ? info.name : 'Ingredient', info?.what);
  if (!info) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🧄" title="Ingredient not found" action="Back home" onAction={() => nav('/')} /></div>;
  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 6', maxHeight: 200, overflow: 'hidden' }}><DishImage id={info.id} art={info.art} seed={info.id} alt={info.name} name={info.name} showCredit eager /></div>
      <div className="container" style={{ marginTop: -20, position: 'relative', maxWidth: 720 }}>
        <div className="card card-pad"><IngredientPanel name={info.id} /></div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
