public class Persistencia
{
    String caminhoArquivo { get; set; }

}   

public enum TipoPersistencia
{
    Texto,
    Binario,
    XML,
    JSON
}
