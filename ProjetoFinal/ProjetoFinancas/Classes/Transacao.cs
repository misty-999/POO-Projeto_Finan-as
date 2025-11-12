namespace ProjetoFinancas.Classes
{
    public class Transacao
    {
        public int Number { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}