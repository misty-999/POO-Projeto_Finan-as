public class Categoria
{
    int id { get; set; }
    string nome { get; set; }

}
public enum TipoCategoria
{
    Alimentacao,
    Transporte,
    Moradia,
    Lazer,
    Saude,
    Outros
}