class transacao
{
    private int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set    // ...existing code...
    using System;
    
    public class Categoria
    {
        // Público: pode ser lido/definido por outras classes
        public int Id { get; set; }
        public string Nome { get; set; }
    }
    
    public abstract class Transacao
    {
        // Público (get) / Privado (set): id visível externamente, só definido internamente
        public int Id { get; private set; }
    
        // Público: valores acessíveis e modificáveis por outras classes
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
    
        // Público: referencia a categoria da transação
        public Categoria Category { get; set; }
    
        // Privado: campo interno não exposto fora da classe
        private readonly Guid internalToken;
    
        // Construtor público
        public Transacao(decimal amount, DateTime date, string description, Categoria category = null)
        {
            Id = new Random().Next(1, int.MaxValue); // exemplo simples de geração de id
            Amount = amount;
            Date = date;
            Description = description;
            Category = category;
            internalToken = Guid.NewGuid();
        }
    
        // Método público para validação básica (pode ser sobrescrito)
        public virtual bool Validate()
        {
            return Amount != 0m && Date != default && !string.IsNullOrWhiteSpace(Description);
        }
    
        // Método protegido: acessível por subclasses, não por consumidores externos
        protected void SetIdForPersistence(int id)
        {
            // Usado internamente (ex.: pela camada de persistência) para definir o Id
            typeof(Transacao).GetProperty(nameof(Id))
                             .SetValue(this, id);
        }
    }
    
    public class Receita : Transacao
    {
        public Receita(decimal amount, DateTime date, string description, Categoria category = null)
            : base(amount, date, description, category) { }
    
        // Sobrescreve validação: receitas devem ter amount > 0
        public override bool Validate()
        {
            return base.Validate() && Amount > 0m;
        }
    }
    
    public class Despesa : Transacao
    {
        public Despesa(decimal amount, DateTime date, string description, Categoria category = null)
            : base(amount, date, description, category) { }
    
        // Sobrescreve validação: despesas devem ter amount > 0 (valor representado positivo)
        public override bool Validate()
        {
            return base.Validate() && Amount > 0m;
        }
    }
    // ...existing code...