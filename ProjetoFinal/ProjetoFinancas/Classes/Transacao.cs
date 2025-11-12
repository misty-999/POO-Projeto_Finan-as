using System;

namespace ProjetoFinancas.Classes
{
 public class Transacao
    {
        // Properties
        public int Number { get; set; }
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } // "Debit" or "Credit"
        public decimal Amount { get; set; }

        // Constructor
        public Transacao(int number, string name, DateTime date, string type, decimal amount)
        {
            Number = number;
            Name = name;
            Date = date;
            Type = type;
            Amount = amount;
        }

        // Method to display transaction details
        public void DisplayInfo()
        {
            Console.WriteLine($"Transaction #{Number}");
            Console.WriteLine($"Name: {Name}");
            Console.WriteLine($"Date: {Date.ToShortDateString()}");
            Console.WriteLine($"Type: {Type}");
            Console.WriteLine($"Amount: {Amount:C}");
        }
    }

  }