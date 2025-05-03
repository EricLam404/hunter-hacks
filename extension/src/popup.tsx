export class Quiz{
    question: string;
    choices: string[];

constructor(question: string, choices: string[]) {
    if (choices.length !== 4) {
      throw new Error("There must be exactly 4 choices.");
    }

    this.question = question;
    this.choices = choices;
  }

  display(): void {
    console.log(`Question: ${this.question}`);
    this.choices.forEach((choice, index) => {
      console.log(`${index + 1}. ${choice}`);
    });
  }
}

export function popup() {

}
//ex: