import { SectionPage } from "../../components/section-page";

export default function Provider() {
  return <SectionPage title="Provider workspace" intro="Apply, publish a protected API and manage its Testnet payment plan."><form className="form"><label>API title<input name="title" required /></label><label>Description<textarea name="description" required /></label><label>Category<select name="category"><option>Text</option><option>Content</option><option>Documents</option></select></label><label>Price in atomic units<input name="price" type="number" min="1" required /></label><button type="submit">Save draft</button></form></SectionPage>;
}
