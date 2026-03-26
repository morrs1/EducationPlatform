import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

function FavouriteCourseCard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const completedLessons = 12;
  const totalLessons = 100;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <article className="favourite-course-card">
      <div className="favourite-course-menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="favourite-course-menu-btn"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen ? (
          <div className="favourite-course-menu" role="menu">
            <button
              type="button"
              className="favourite-course-menu-item"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              Убрать из избранного
            </button>
          </div>
        ) : null}
      </div>

      <div className="favourite-course-card-content">
        <img
          className="favourite-course-card-img"
          src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMQEhMRExISFRUTGRsbFhYYGRUWEhgXGBceFhgWFxgYHSgiGB0oHxsVITIiJSkrLi4uGCEzODMsOigtLi4BCgoKDg0OGxAQGjMmICMtLy8tMDEtLS0uLy4zLystLS0tLy0tLy8tLS02LS0tLS8tLTAtKy0tLS0tLS8tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAwADAQEAAAAAAAAAAAAABAUGAQMHAgj/xABDEAACAQMDAQUEBggFAQkAAAABAgMABBEFEiExBhMiQWEyUXGRBxQjQlKBFTNTYnKCodEkQ2OSscE1VIOisrPC4fD/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQMEAgUG/8QALxEAAgIBAwIDBgYDAAAAAAAAAAECEQMSITEEQQUTkSJRgaHR8DJhcbHB8RRS4f/aAAwDAQACEQMRAD8A9LpSlemeUKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKha3Lstrh/wxSH5ITQlGct3huYRf39/Pawzuy2sccpgXuwSqu20Zd22lueADVk9neWqCe3m/SdqRnHg+uBfxRSJhJx1OCAT5Gs7FbK82mQOoZbfTEcDy3yCNCfkG+dcdjRe9/NHpJQWpJEskoJs45Mjx24BBZ9ucqvh6Z8qy63fP0PV/xo+Trdc1Xc2ml6rDcxd9E4ZOh8ipHVXB5Vh5g1Fuu1FlEcPeWykdR3iFvkDmpFl9Gtpvaa7L3k0hDSPLhY2YDGe5jwnT3g/Gr59Jt7aF+5t4I9qnASNFHT90Un1Sim64Mselt1Zkk7Z6eePrtv+bgf1NW1pfxTLuiljkX3oysMfEGo7XQPDRoR7sf3qqvNA0+c5ks4gfNkHdsfeGMe0sD0IOa8+HjeJ8o2y8HmuGfUnaYzMY7CE3LKcNLnZaIfWXHjPogNQ74TRr3l5qqwj8MCRRxg+4PNuZj/APsVM1/UHt7Z/q0G4RriOFAFGB6DyHXavJrK9mtPiu2W5kkFy7DO8+yv7kaHiMD4ZqYdZk6m5QemK+Lf0/X9zTh8NhF6WrfO/wB7l3Y6vJCYZRdi9s55BEZCEE0MjcIS0YAdC3hOQCMjmtlXlN4AkerRoMAXFuVA8nMkHPzr1Y16HTTlJNSd06+Sf8nl9dhjjmtPf+hSlK0mEUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBUPWId9vOn4o3HzQiplRtSvFghlmf2YkZ2+CqSR/ShK5PP9I0c6vPZokjCGLT7ZL114OdocQKw+83n7lz8K9osbOOCNIokVI0GFVRhQB5CsZ2M0aXT9FVLaMfWpI+8wcAd/KBt358kyoPold3YrsM9k/1me9uri4cHfmRhb5PUbD7WPefdwBWGbT78Hp7m0rruYt6Mv4gR8xiuylUtWqOk63MARjg9a4Bq47SaZgs4GUf2h7ieD+R/wCa87g7HC0uEuLNzGNwEsJJMboThtp6ggZIBzyOor5p9NGEpQnKmuNtn8e3oe/HO5xUoq1396NbWX1uwe0kN9bLnzuYR0kXzlQeUgGSfxD166ilV9P1EsM9Ufivei6cNS/PsYPSQZ0jbH/aF+r4PXuY2Mv/AKYl+deq1jYY0TUbOMgKiwTdwB070lQ6geWIgcehb3Vsq+w6CWvF5n+zb+f8HyniTfnafchSlK2nnilKUApSlAKUpQClKUApSlAKUpQClKUApSlAKz/bhe8tlt+f8VPBDx12ySrvH+0NWgqi10hrvS4urG67zb57Y4JCWx7gWXJ9RXMnUWWY1c0ehAYrmqPtvr36PsZ7oAFo18APQuxCJn03EZ9M14x2Qu9UuIbzVxqUn+DyzQuWaKbYneOhTIWMFeBhepOMdaxRxuS1HoNn6DpUXSr5biGKdfZmRXX4OoYf81Kqsk4ZQRgjIPUeVUN/2f8AvRHH7p6fkf71V9t72ea4t9Ltp/qz3KySSTgZkSKPA2xjI8TEnnIwFJrz/wCjjtVd2uqvplxcvcxtJJFudmcrJHnDozEkA7cFc8bvTnnJ0cM8Pa7epZjzzxO4s3k1jIntIw9cZHzHFR639K8qXhMb2l8jevEpd4nk/auNo4orwK3+EmjkLYONhbu5Bn3bXb5Vsq7PpEQNpd+D/wB3lP5hCR/UVEsX3RRt13Ipz8VBr2/DsPk4tF3ueP4hl82anVHfSlK3nnilKUApSlAKUpQClKUApSlAKUpQClKUApSlAKy+k3jHVL2bCn6ukUEeckAMvfSEDPBJKjPuWtRWW0S0P6Uv4NygzJDPGDnxKF7mTHwZR86o6i/LdG3oNHnLXwX3ayzbVtOubVcLKVBTnwlkYOoyegJXHpmvBrTQNRuZzaR288Jk2pKgWSKDCdHm+6QOTk59Mkiv03penCEHnLN1Pl8BU4is+HNKEaZrzxg5vRwee9tdZutGgtI7aNGt44xG8pjeUqyKqxgqrrtBAPiOeeOK0nYfUbq6s45ryFYZXydihl8GfCSrElSRzgn+1eYfSZfajYtHpsUpniuVPdMVY3IAbHdF92HIG3xlc4PPOTVt2V1jV57y1tr3ZFEwdyYiveP3QB2uQ7YXcUztAznGcEiu3BaE9v5K0pc1scfTj2duZDb39qJS0AZH7rd3qqTlXXbzgeIHHTI8s1mfoh7Lzz3kF3LAYobQMS7KytNIwIX2uWxnJPp617/UbUoWeJ1XqRx884/PpXKzNQ00SoJyVs6m1eEHG/5AkfMCpkbhgCCCD0I6VjGgYHBVs+7BzWg0hDDETJxk5A8+n/NZoScnVG3qOnx44alI+O1jj6rOrdGjfP8ADsOazHY1ibCzJ6/V4v8A2xXz9I2pMbZ4k/W3ZFvCvrL4WPHkE3sTVnbxJbxImQqRKqgkgAKoCjk9OlejhjpR42eVkilQbbWbaRtqXEDt+FZEZvkDU6rjPQpSlCBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAVQ9qNIkl7q5tmCXVqS0RPCup4eF/wB1h5+R93Wr6lCU2naI/Zbtsl2CjKY54+JYH4mjI68ffX3MOMEdOlaVL5D54+NYzW+ztvebWkUrInsTRkxzp/C68/kcj0qBHaalb8R3EF2g6LOpinA93exghj6lazywJ8GqOc13aLRY73u2EvdzQEmKVdrFdw2upVuGRhjI9AcggV1aB2dFvK1xLOZ5mXYG2rHHHHncVjQE43EKSSSTtHkMVmNJ7UyztIhsZswuY5GikgkjDgAkAs6FsZHQVpI2yAcEZ8jjI9DiuPK/Mt86SVdjQmZR95fmK63vUH3s/Dms1eXhj6QzSfwBT+WWYCq19Xum/V6dL8ZZreNf/I8h/pUeUiPMZrpdT/Cv5n+wrPdoe0MVqveXEnLcIg8UsjHgLGg5Y5wPd76zWv3WpIiSSSW9tC0sccjQhpZY1kO0OZJQFHiKD2fvZ8qudJ7NQWzmUB5Zz7U8zGSc+m4+yPRQBVsMaXBVOdclTaxvuk1a/Xu+5jbuIPaMEWMsx98z9DjoOPQfFhpAutt1qSmR3G6O2PNvbofZUocB5CD4mYemBip3b1d1qqH2ZJ7dX/hM6ZBro7VX/cxySHOF3M2OpCjO2vO8V6jJiUcePmR6HheCOVynPsdt5pdjMNn1O0IAx+rjDAe4FACv5GotjO+nyxRGR5LSdtkZkO6S3lPsRlzy0bdFJ5BwPjR3C3lrHFdTiIwvgyCMP3lvu9lmJJDqMgMRjHwqZ2qvkfT5vENzKvd46mQOrRFMdTuC9PWsWKfVdL1EY5N1L4r7Rty4+m6nBJ4+xv6VwucDPXz+Nc19KfMClKUApSlAKUpQClKUApSlAKUpQClKUApVFd9qIRIYIFkupx/lQDeV8vtH9iMfxGvr9C39wN15dR6fExAEcDK05LkKqtcONqsWIACLySOa4lkjHkthilIu6otf1l1ZbO1US3kw8CfdiXoZ5j91F6+9jgCqy+j1CC5h0+e7jiimJEV8It0spyMQHJ2RTEbsMRhuMc8VvuzfZq3sEKwqSz8ySud88rfikc8t58dBk4AqueZJbFsOnd+0V+iaFFZpFZIzM6o0jueS7FxudsnOWZmP8uPKrF9PYea/P/6qv0q57zVb0A8RW9qo93L3Dk/1HyqT29lKadeSLw0cLup9zIN6n5gVn1yTNDhFkhdNbzKj5mpEWmqOpJ/oKmRtkAjoRn51R9vLpodOvJUJDpC5UjqCF4NNcnsNEUWeo6bFcQyW8iAxyqVZenDDBxjofXyNYbRriS3lOnXRJljGYJT0uYBwHB/aLwHX8+Qa9Bifcob3gH581T9rez4vodobu5ozvt5h7UUo6H1U9GHmCanHk0sjJjU1RnO1+ntc2c8SfrNu6PHXvIyJEx/MoH51OgsrbVNNEqqCLqIkngspdSrgHyKncOPNajdndUNzDuZdksbNHNH+CaM4dfh0I9GFR+z91+jbw2zcWt85aA+UVy3Lw+ivyy+uRjmrs+NSqdW0U9PklG4XVnT2RvjLC1rOF7+1xDOh5DDGEkwequuD86+rLsZYwyCZLcBlOVBaRkRjzuRGYqp+A48q57eWhspo9TjBxF4LhR9+2ZvEcY5aNiGHpmr1Tnkcg9D5VbFqSsqyJwe3c5pSldlIpSlAKUpQClKUApSlAKUpQCuCao77tAe+a0tYHublQC6LhIog3IM0rcLxzgZJri57NeFZtYu8xs6qLeLfHZKznCiVh4pBnA3OVXJxjmuJZFEuhhlLc4k7TLI5hsonvJRwe6wLdD/qTnwL8Bk+lSoOxk93/wBo3OVPW0ti0cGDkYlk/WSg/wAoyKvdTjms44msoImhhz3lsihHZOOYCMKHXBOwjDZxkHFR7qyi1FI76zlCThfsbhR1AJzDMnBdN2QUblTnG1hWaWaTNUMMYnfYz29nMtgkAt1dcwMqqsMrAZdFI/zB1w3JHIzg4hROSzaXqGJlnVu4mYAC4QDLRuFwFnQc8Y3AbhjBA7oHTVbeW3nQxTxMFlQH7SCZcPHLE3mPZdH8x18xXRbo2oW8tnctsu7VlzIgwVkXxQXcXuDABsdM70OcGqiw6YrIXCTaNfM0jKm6GY/rJYc4SUH9tG20Mfftb7+KpbT6QVtkezv3dLi1Jjlk7t2SXAJjcMoIUyIA204JOfhVvdXUl1ZreKmL3T3YvGPOSLw3EI96SJkr/FG3lUXtLHA1zaXZCyWmpxi1uB9xhIO8tZOOh3ZXd5bxzwK7g1e6Ias6ewmoPJql4ZIJIDPbQSRpJgStGjyR72UewSW9k8j860X0kvt0u+P+g4+a4/61j9QlksGsb2Ri31KSSyupDyTA7DuJpD8O5ZvV6t/pKvGmsWthgG6lhhBHUmSZQcfkGqXFyeoi0tjb2QxGgP4V/wCKzP0pXSppl2GYAvGyqPNmYbVAHmSSB+dXmvakLS2nuSMiCN3x79qkhfzwB+dZLQuyts8cVxqMaXN3dqGd5RvVdw3CKNTkRqu4KMVXFpbs70uWyO3StC1G5jSS6vpbXKjbb2oiHdjHAkldWLtjGcYGelT7N7uxlSO4l+tW0rBEnKqk8MjcIswXCujHChwAQxAIOciHpNqdKvI7VGZrK73CFGYt9XuEUyGJWJyI3QOQD0KevOwnnVBkn+9S92RwYi5i7jVp0Hs3cCTY8u8ibuZCPdlTD8q57UacLm1miJwdpZG6FJE8SOCOhDAGo/aSCa91SFbWYQyQWsjszIJEYSTIqxuuQcNsc5ByNtdkvZnU7pTDcz2cMLcSNbCVp3U9VUy8R5GRnxEZrTDIoxqRmnicp6ol1ZyfpHS4ZJQM3ECmQeX2iYcfDk1n+wdyZNPtSxyypsPnzExi/wDjWo1y7h0+zbACRwR8KOgSMeFR8go+NZvsVZNBY20bjD7Nzg9Q0hMjA/AsRTBwOoLulKVeZBSlKAUpSgFKUoBSlKAUpXXPMsas7sqqoyzMQqgDzJPAFAVWtaH3rrcQuYLuIfZzqOo/Zyr/AJkZ9x6eXrbdnNfXUFls7qFY7hFxPbt4o3RuO8jz7cTf06HyJoINVub87dOjAj6G8mDCAc89ynDTnrzwuR1qJrPZGa2Pfwx3dxeR4dL4SRMxIBzE1uzoFhOWUqgJwc81my6H+ptwqaW/BqdLmbTpkspWZreU4s5mOWUgZ+qSMepABKMfaAIPI541FP0bcfW04tblwLpfuxSt4UugPIE7Vk+Kt5MTzouoQ63YsksbRv7E8RyssEy4IIzypBw6t8PMEV2aPfd/BNZ3u1pocwzjHEyMvgmC/hkTn3Bgw+7VFO6L7OO1CfVZYtSXgR4iuh5Nbu3Dn1iYh8+SmT31x2nYWtxbX4IAyILgfihlbEbn1SUpz5LJJ76g6HeNNay2Mx3mAtbyluWkj2ju2bPm0Txk+pNfVlp5NqlvclZj3YjlPO2TA2knPPOM/GrI433K5ZEuDsE7xX8rRqwjuogzHGVWaEiPJPQF43Qc/saqNW0QrpVxaq5Yxo8kBA2lTE5uIUHP3QFTPnipes9pYbdxCN81w3s28Q3zH1YdI1/eYiqh9Pub7eLqRQFGf0fbyAM2VyEuJsgnOeg2r0Oas0pI41O7Z3a52vsjYSvJJbOZ4RI8HeKJJWaJVVSudwOAg4HG3PlUDsX2Ys7kQwz3L30sMSOzLdOIYGPhjihELDcwCvls5GAfvACSbS2hYGSCXTFwPCbSzktSR955likC/FpF6VNn7KxyoJDZaZfxNyJLZVtLkjyKMrFJD695HXEpJKlsWxRca5p6S6Zf21t3r4jmRd8ksxaRV5RXldiQGGzGcAgjyNd3Z7UVntILpwGjaOJo8Y3K+0Bl48wwIOfdWd0y0nj3Lpd5JmPmTTr0ESLubJ2SEd5HnxYbxoxOc1k+zvaxrCWewvIvqsUkjPFG5JNs7HO1m2gGFjkh1BA59+RW8blF1yW45qMva4PXbe0huPGN3hlWQA4BV1zz8CCwPoSKrO0vaGC3O6aUKMMUXq7hSAQij2jllGP3hUODVktoXmmmgjjYDxBwykDPRvvZzwAM/OqzQrY3czajPFjOFtEceOOIZPekH2Xckn3hQorvBjdWyvrJxU3pdogaPqV5azT3k9jO31rYQYCsksUSDEcMkJIORksSucljxxV630g5GFttQdvwi1kVvzLgKPnVvStDxpmJZmZZ7G61KRJLxO5t42Drbbg8krqcq1wy+EKOCIxnnr0rU0pXaVFcpOXIpSlScilKUApSlAKUpQClKUBwa8xsIbnUe6vJ7vSGVxujs7h5O6j5I8USMu9vV93X5XPbvUnE8NqblbaCSNnd9yxu5VgvdLIxGwENnjk4NUWga5LbQR2qDRJRGMbmlJlbxEgnb58+tRKEmvZL8Uox/Ebe+gvrhFE9jo96icoqSuuOMeHvI2C+7rVbPLbwfr7fVNKOP1iO81mPjsaSL/cgFddr2oni5bTYSp6tbTAH/bIg3f7qtLXtrBMRGlwbWY9IruPYreW3Jba3ptfPPn0rPLDKG7RfHNGeydlO0lxp9xHqySw3lm4Ed3NDgO0WcJLJGhKs8Z+8uDgkbQOa2Wo6Z/i0u0cbWiZX8xIpIeMg/unfj0kNZfUtLiV23J+jLibwmWP7TS7rdkd3MpAXxZPDqjEngtiqHSu0GoRQDTBE3+DdopL2GN7wRoBlFSNByQCAC3koyMg1C3dnbVqkbrWNXtrId5Myo0hAAAzNKw8KhVUbnPQenpVFeTXt2jOwmsbYDlY1MupSKeOFQHuevQBmGKaE2jqXxfst3ICGnucx3gJ48BnUBPQKMfGtTbaNdxAPb38c4PIFzEj5HuWW3MePjtapeRI4WNlFoFlbFe5065t4JQd0iyIXuJD/AK0cjJLnPmSKl6jY4wb/AE1JgvS7tCzzJ5Z2+GeP/wAMvUnVbxXUJqmmjYvInjH1q3U/i3BRLF/FsAH4q7rOzmjQTaddrcwHkQTyGVCPdFdDc6fz7x5eGqnNssUUjr03vwnfafeJewdDDcNmQY6otwBuVh+GVWPvIrpsbS3uJJGtGk069TxSw7QoJPnNBnu50P7RDk+Tiu6K2ivpHmg72x1CIAS5UB+c7ROgOy5iODhgT0O1lIOJusy28MMF3qRgiltzuEiM4w/msRGHcMOseDnoQcZrg6OoWLX4KXULW91bEd3cRE7ctnElvKRyp2+KJvQMCCCaP6QDa3KJZFWu9RRQY+4VRLG+BmSQnKwxk4yrnBB6HrUi71C81AHBfTrQ9XOBqEq+9QeLZevibLdMAVCvbiDTYNsZFlC55YL3l/cOf2aPks5JHjkBx+ADDV3GLshtFf2F0S1lt4rp7O2WfLqxVBtDxyNGWUdFJ2549/FbSvK+xSTWU9tGGbN2zme3Y72CeNkuOvgYAIpPRunUV6pW9qtjz5u3aFKUqDgUpSgFKUoBSlKAUpSgFKUoBSlKA6Li0jkx3kcb46blVsZ64yOPKo82iWrjDW1uw9xijI/qKn0oTbM5cdiLJiWjiMD/AI7d3hb5IcH8xVRqXZm6RSB3V9F5xShYrjH7rgd25/iUfGt1SpTa4D353PJJLhUjezjub6JJPC+nmNpJiDzsiDA92px7SttxTTS1rJHNBHPZmJzBeRW4SWZUI3xuQVIk+6d2CSCwzxmvW6pdU7MQXEhmJmjkZQpeKWSIsFzt3bTgkZPJFL5VcnSlxu9viVqdqraf7KS+tpR5xX9v3TN6b3CoP9pqxj7J24xLB3tk7c7rOVhEf5GBjkX+UVU3vY6bBEV4ZB+zu40mRvQuoVx/Ws4YZdNbP22nkn24z3+mSE4HjQjEeeniVfPmqvJXZ+pcsz/rf5fSz0SK/wBTtfaEOoxDzQC2vQPM7Ce7k4/CVJr40i7sLmczWs7Wdwp3XMDDuXdRguJ7d8AnH+avIz7RHFU9n22KKI75O5VwNt1B9paHPRuQxh8uTuX8qi/SHE0tvC7w294hmg7mdDHvKtKPs/EcbWGF3K5Uk8qgqiWKnT2L4ZNStGmvu2jXBaLTI1nI4e6clbGLA8nHM5H4U9/WonZ3SIpHN5LM93MPZupAO7HHItE9iNB5uuep8WcgVmrzRW4QagyuxH2GmW43R48t64Hegc8vtiHkrdaodd1We8ZYrkN48GPTbc5dh5G5k4yo464QYyAa6hib4495zPIlz6Gi1fttuLx2ASUr+suXOLKIDqd/HfEemFHGSazWkafNeSGaFmkduH1GdcjA+7aQnAIHOOiDnrV7pXY8yBWvdhVfYtI+LVMdO8/bMPXwjnArYKMAAcAdB5Ae4VpSUfw+v3wZZTvn07f9/YrND0GGzDbAzSPzJM53TSH3u5/4HA91WlKUOG7FKUoQKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAK4ZQQQQCDwQeQR7iK5pQGSv8AsiYsvYsseeXtnybST37QOYW9V49Kxt3FDGO7NxNpjK6yyW78w74yGEkGAVcggYKYzjlTXr9fLIDjIBxyM84PvFTe1HSe99zzrQ9Cmmy0CyW6PzJdzjffz89UV87AfxPzzkAVttF0SCzUrCmCxy7klpZG67nc8sev/SrGlG7IsUpSoIFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgP/2Q=="
          alt="Обложка курса"
        />

        <div className="favourite-course-card-body">
          <div className="favourite-course-card-meta">
            <Link
              className="favourite-course-card-title"
              to="/courses/template-course"
            >
              Так называемый избранный курс
            </Link>

            <Link
              className="favourite-course-card-author"
              to="/authors/template-author"
            >
              Автор курса
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FavouriteCourseCard;
