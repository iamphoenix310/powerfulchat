export default async function handler(req, res) {
    // Wait for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 50000));
  
    // Send a response indicating the countdown is complete
    res.status(200).json({ message: 'Countdown Complete' });
  }
  