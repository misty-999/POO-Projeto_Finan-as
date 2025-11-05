using System;

namespace ProjetoFinancas.Classes
{
    public class Transacao
    {
        public int Id { get; set; }
        public DateTime Data { get; set; }
        public float Valor { get; set; }
        public int Categoria { get; set; }
    }

    public enum TipoTransacao
    {
        Receita,
        Despesa
    }
}


