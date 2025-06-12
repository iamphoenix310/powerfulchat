import Link from "next/link";
import SimilarPeople from "@/components/People/similarPeopleChat";

interface SimilarPeopleChatProps {
  personId: string;
  profession: string[];
  country: string;
  gender: string;
}

const SimilarPeopleChat: React.FC<SimilarPeopleChatProps> = ({
  personId,
  profession,
  country,
  gender,
}) => {
  return (
    <div className="mt-8">
      <SimilarPeople
        currentPersonId={personId}
        profession={profession}
        country={country}
        gender={gender}
      />
    </div>
  );
};

export default SimilarPeopleChat;