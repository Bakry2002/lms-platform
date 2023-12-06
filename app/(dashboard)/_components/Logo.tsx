import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
    return (
        <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={130} height={130} />
        </Link>
    );
};

export default Logo;
